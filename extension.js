const vscode = require('vscode');
const utils = require('./utils')

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.insertNamespace', function () {
        utils.replaceSelectionWith('namespace')
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateClass', function () {
        utils.replaceSelectionWith('class')
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateInterface', function () {
        utils.replaceSelectionWith('interface')
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateTrait', function () {
        utils.replaceSelectionWith('trait')
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPClass', function (folder) {
        utils.createPHPFile('class', folder)
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPInterface', function (folder) {
        utils.createPHPFile('interface', folder)
    }))
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.newPHPTrait', function (folder) {
        utils.createPHPFile('trait', folder)
    }))
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
