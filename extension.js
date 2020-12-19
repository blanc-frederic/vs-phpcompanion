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

    tests.initStatus(context.subscriptions)

    context.subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.launchTests',
        () => tests.launchTests()
    ))
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
