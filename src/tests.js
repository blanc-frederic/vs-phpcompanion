const vscode = require('vscode')
const child = require('./process')

let testsStatusBar
let process
let lastPath

const documentProvider = new class {
    scheme = 'phpcompanion'

    provideTextDocumentContent(uri)
    {
        if (uri.path === 'Tests') {
            return '\n' + process.getRawOutput();
        }
    }

    provideDocumentLinks(document, token)
    {
        let links = []

        const content = document.getText().split('\n')
        for (let lineNumber = 0; lineNumber < content.length; lineNumber++) {
            const currentLine = content[lineNumber];

            const matches = currentLine.match(/(\/[^:\s]+)(:(\d+))?/)
            if (matches) {
                const position = currentLine.indexOf(matches[0])
                const linkRange = new vscode.Range(lineNumber, position, lineNumber, position + matches[0].length)
                const linkTarget = vscode.Uri.parse('file://' + matches[1] + (matches[3] ? '#L' + matches[3] : ''))
                links.push(new vscode.DocumentLink(linkRange, linkTarget))
            }
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

async function showLogs()
{
    await vscode.window.showTextDocument(
        vscode.Uri.parse('phpcompanion:Tests'),
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
        if (code > 0 && typeof output === 'string') {
            updateTestsStatusBar()
            showError(output)
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
        testsStatusBar.text = `$(beaker) Launch tests (keybindings:phpcompanion.launchTests)`
        return
    }

    if (output.failures > 0) {
        testsStatusBar.text = `$(beaker) ${output.assertions} $(error) ${output.failures}`
        testsStatusBar.command = 'phpcompanion.showLogs'
        return
    }

    testsStatusBar.text = `$(beaker) ${output.assertions} $(pass)`
}

function showError(message)
{
    vscode.window.showErrorMessage(message)
}

function showResultBox(output)
{
    if (output.failures > 0) {
        vscode.window.showErrorMessage(
            `Tests : FAILURES! ${output.tests} tests, ${output.assertions} assertions, ${output.failures} failures`
        )
        return
    }

    vscode.window.showInformationMessage(
        `Tests : OK (${output.tests} tests, ${output.assertions} assertions)`
    )
}

exports.launchTests = launchTests
exports.createStatusBar = createStatusBar
exports.showLogs = showLogs
exports.documentProvider = documentProvider
