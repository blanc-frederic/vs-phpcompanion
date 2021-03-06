const { commands, languages, Uri, window, workspace } = require('vscode')
const { createPHPFile, replaceSelectionWithNamespace } = require('./src/generator')
const { getConfig } = require('./src/config')
const { TestsRunner } = require('./src/TestsRunner')
const { TestsStatusBar } = require('./src/TestsStatusBar')
const { Process } = require('./src/Process')
const { DocumentProvider } = require('./src/DocumentProvider')
const { PHPUnitParser } = require('./src/PHPUnitParser')

function activate(context) {
    if (getConfig('activate.createPHPFile', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.newPHPClass', (folder) => createPHPFile(folder))
        )
    }

    if (getConfig('activate.insertNamespace', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.insertNamespace', replaceSelectionWithNamespace),
        )
    }

    if (getConfig('activate.runTests', true)) {
        const statusBar = new TestsStatusBar()
        const process = new Process()
        const provider = new DocumentProvider(process)
        const runner = new TestsRunner(statusBar, process, new PHPUnitParser(), provider)

        context.subscriptions.push(
            commands.registerCommand('phpcompanion.runTests', () => runner.run()),
            commands.registerCommand('phpcompanion.openLogs', openLogs),
            statusBar,
            workspace.registerTextDocumentContentProvider('phpcompanion', provider),
            languages.registerDocumentLinkProvider({ scheme: 'phpcompanion' }, provider)
        )
    }
}

function deactivate() { }

async function openLogs() {
    await window.showTextDocument(Uri.parse('phpcompanion:Tests'), { preview: false })
}

exports.activate = activate
exports.deactivate = deactivate
