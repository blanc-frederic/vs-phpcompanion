const vscode = require('vscode')
const generator = require('./src/generator')
const tests = require('./src/tests')

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.insertNamespace',
        () => generator.replaceSelectionWithNamespace()
    ))

    context.subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.newPHPClass',
        (folder) => generator.createPHPFile('class', folder)
    ))

    context.subscriptions.push(tests.createStatusBar())

    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider(
            'phpcompanion',
            tests.documentProvider
        )
    )

    context.subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.launchTests',
        () => tests.launchTests()
    ))

    context.subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.showLogs',
        () => tests.showLogs()
    ))
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
