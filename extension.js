const { commands, languages, Uri, window, workspace } = require('vscode')
const { createPHPFile, replaceSelectionWithNamespace } = require('./src/generator')

const { TestsRunner } = require('./src/TestsRunner')
const { TestsStatusBar } = require('./src/TestsStatusBar')
const { Process } = require('./src/Process')
const { DocumentProvider } = require('./src/DocumentProvider')

function activate(context) {
    const statusBar = new TestsStatusBar()
    const process = new Process()
    const provider = new DocumentProvider(process)
    const runner = new TestsRunner(statusBar, process, provider)

    context.subscriptions.push(
        commands.registerCommand('phpcompanion.newPHPClass', (folder) => createPHPFile(folder)),
        commands.registerCommand('phpcompanion.insertNamespace', replaceSelectionWithNamespace),
        commands.registerCommand('phpcompanion.runTests', () => runner.run()),
        commands.registerCommand('phpcompanion.openLogs', openLogs),

        statusBar,

        workspace.registerTextDocumentContentProvider('phpcompanion', provider),
        languages.registerDocumentLinkProvider({ scheme: 'phpcompanion' }, provider)
    )
}

function deactivate() { }

async function openLogs()
{
    await window.showTextDocument(Uri.parse('phpcompanion:Tests'), { preview: false })
}

exports.activate = activate
exports.deactivate = deactivate
