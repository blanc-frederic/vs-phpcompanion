const vscode = require('vscode');
const generator = require('./generator')

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.insertNamespace', function () {
        generator.replaceSelectionWithNamespace()
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPClass', function (folder) {
        generator.createPHPFile('class', folder)
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPInterface', function (folder) {
        generator.createPHPFile('interface', folder)
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPTrait', function (folder) {
        generator.createPHPFile('trait', folder)
    }))
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
