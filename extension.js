const { commands, languages, workspace } = require('vscode')
const generator = require('./src/generator')
const tests = require('./src/tests')

function activate(context) {

    context.subscriptions.push(
        commands.registerCommand(
            'phpcompanion.newPHPClass',
            (folder) => generator.createPHPFile('class', folder)
        ),
        commands.registerCommand(
            'phpcompanion.insertNamespace',
            generator.replaceSelectionWithNamespace
        )
    )

    context.subscriptions.push(tests.createStatusBar())

    context.subscriptions.push(
        workspace.registerTextDocumentContentProvider(
            tests.documentProvider.scheme,
            tests.documentProvider
        ),
        languages.registerDocumentLinkProvider(
            { scheme: tests.documentProvider.scheme },
            tests.documentProvider
        )
    )

    context.subscriptions.push(
        commands.registerCommand('phpcompanion.launchTests', tests.launchTests),
        commands.registerCommand('phpcompanion.openLogs', tests.openLogs)
    )
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
