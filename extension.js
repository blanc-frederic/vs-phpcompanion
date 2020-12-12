const vscode = require("vscode");
const utils = require("./utils.js")

function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.insertNamespace', function () {
        let editor = vscode.window.activeTextEditor

        editor.edit(eb => {
            eb.replace(
                editor.selection,
                "namespace " + utils.getNamespaceFromPath(editor.document.fileName) + ";"
            )
        })
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateClass', function () {
        let editor = vscode.window.activeTextEditor

        editor.edit(eb => {
            eb.replace(
                editor.selection,
                utils.generateCode(editor.document.fileName, "class")
            )
        })
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateInterface', function () {
        let editor = vscode.window.activeTextEditor

        editor.edit(eb => {
            eb.replace(
                editor.selection,
                utils.generateCode(editor.document.fileName, "interface")
            )
        })
    }))

    context.subscriptions.push(vscode.commands.registerCommand('phpcompanion.generateTrait', function () {
        let editor = vscode.window.activeTextEditor

        editor.edit(eb => {
            eb.replace(
                editor.selection,
                utils.generateCode(editor.document.fileName, "trait")
            )
        })
    }))
}

function deactivate() { }

exports.activate = activate
exports.deactivate = deactivate
