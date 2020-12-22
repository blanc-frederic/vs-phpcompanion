const vscode = require('vscode')
const child = require('./process')

let testsStatusBar
let process
let lastPath

const documentProvider = new class {
    onDidChangeEmitter = new vscode.EventEmitter()

    scheme = 'phpcompanion'
    testPath = 'Tests'

    onDidChange = this.onDidChangeEmitter.event

    provideTextDocumentContent(uri)
    {
        if (uri.path === this.testPath) {
            if (! process) {
                return ''
            }

            return '\n' + process.getRawOutput();
        }
    }

    provideDocumentLinks(document, token)
    {
        let links = []

        const content = document.getText().split('\n')
        for (let lineNumber = 0; lineNumber < content.length; lineNumber++) {
            const currentLine = content[lineNumber]

            Array.from(
                currentLine.matchAll(/(?<url>\.{0,2}\/[^(:`\s]+)([(:](?<line>\d+)\)?)?/g)
            ).forEach(element => {
                const linkText = element[0]
                const position = currentLine.indexOf(linkText)
                const uriAdjust = element.groups.line ? { fragment: (element.groups.line -1) } : {}

                const linkRange = new vscode.Range(lineNumber, position, lineNumber, position + linkText.length)
                const linkTarget = vscode.Uri.file(element.groups.url).with(uriAdjust)

                links.push(new vscode.DocumentLink(linkRange, linkTarget))
            });
        }

        return links
    }
}

function createStatusBar()
{
    testsStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    testsStatusBar.show()

    updateTestsStatusBar()

    return testsStatusBar
}

async function openLogs()
{
    await vscode.window.showTextDocument(
        vscode.Uri.parse(documentProvider.scheme + ':' + documentProvider.testPath),
        { preview: false }
    )
}

function launchTests()
{
    const activeDocumentUri = vscode.window.activeTextEditor.document.uri

    let path = lastPath
    if (activeDocumentUri.scheme !== documentProvider.scheme) {
        path = vscode.workspace.getWorkspaceFolder(activeDocumentUri).uri.fsPath
    }

    process = new child.Process()
    process.run(path, (code, output) => {
        documentProvider.onDidChangeEmitter.fire(
            vscode.Uri.parse(documentProvider.scheme + ':' + documentProvider.testPath)
        )

        if (code > 0 && typeof output === 'string') {
            updateTestsStatusBar('Error (see logs)')
            showResultBox('Tests error (see logs)')
            return
        }

        lastPath = path
        updateTestsStatusBar(output)
        showResultBox(output)
    })

    return
}

function updateTestsStatusBar(output)
{
    testsStatusBar.command = 'phpcompanion.launchTests'

    if (! output) {
        testsStatusBar.text = `$(beaker) Launch tests`
        return
    }

    if (typeof output === 'string') {
        testsStatusBar.text = `$(beaker) $(error) Error`
        testsStatusBar.command = 'phpcompanion.openLogs'
        return
    }

    if (output.failures > 0) {
        testsStatusBar.text = `$(beaker) ${output.assertions} $(error) ${output.failures}`
        testsStatusBar.command = 'phpcompanion.openLogs'
        return
    }

    testsStatusBar.text = `$(beaker) ${output.assertions} $(pass)`
}

async function showResultBox(output)
{
    let action = ''

    if (output === 'string') {
        action = await vscode.window.showErrorMessage(
            output,
            'Open logs', 'Close'
        )
    } else if (output.failures > 0) {
        action = await vscode.window.showErrorMessage(
            `Tests : FAILURES! ${output.tests} tests, ${output.assertions} assertions, ${output.failures} failures`,
            'Open logs', 'Close'
        )
    } else {
        action = await vscode.window.showInformationMessage(
            `Tests : OK (${output.tests} tests, ${output.assertions} assertions)`,
            'Open logs', 'Close'
        )
    }

    if (action === 'Open logs') {
        vscode.commands.executeCommand('phpcompanion.openLogs')
    }
}

exports.launchTests = launchTests
exports.createStatusBar = createStatusBar
exports.openLogs = openLogs
exports.documentProvider = documentProvider
