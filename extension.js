const { commands, languages, Uri, window, workspace } = require('vscode')
const { createPHPFile, replaceSelectionWithNamespace } = require('./src/generator')
const { RefactorProvider, extractMethod, extractVariable } = require('./src/Refactor')
const { TestsRunner } = require('./src/TestsRunner')
const { TestsStatusBar } = require('./src/TestsStatusBar')
const { Process } = require('./src/Process')
const { DocumentProvider } = require('./src/DocumentProvider')
const { PHPUnitParser } = require('./src/PHPUnitParser')

function activate(context) {
    const config = workspace.getConfiguration('phpcompanion');

    if (config.get('activate.createPHPFile', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.newPHPClass', (folder) => createPHPFile(folder))
        )
    }

    if (config.get('activate.refactor.extractMethod', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.extractMethod', extractMethod)
        );
    }

    if (config.get('activate.refactor.extractVariable', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.extractVariable', extractVariable)
        );
    }

    if (
        config.get('activate.refactor.extractMethod', true)
        || config.get('activate.refactor.extractVariable', true)
    ) {
        context.subscriptions.push(
            languages.registerCodeActionsProvider('php', new RefactorProvider(), {
                providedCodeActionKinds: RefactorProvider.providedCodeActionKinds
            })
        );
    }

    if (config.get('activate.insertNamespace', true)) {
        context.subscriptions.push(
            commands.registerCommand('phpcompanion.insertNamespace', replaceSelectionWithNamespace),
        )
    }

    if (config.get('activate.runTests', true)) {
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
