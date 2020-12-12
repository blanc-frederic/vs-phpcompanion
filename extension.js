const vscode = require('vscode');

let utils = require('./utils');

function activate(context) {

    let disposable = vscode.commands.registerCommand('phpcompanion.insert_namespace', function () {

        let nsVendor = "";

        let config = vscode.workspace.getConfiguration('phpcompanion');

        if (config.has('vendor')) {
            if (config.get('vendor') && config.get('vendor').length > 1) {
                nsVendor = config.get('vendor') + "\\";
            }
        }

        let editor = vscode.window.activeTextEditor;
        let path = editor.document.fileName;

        let ns = utils.getNamespaceFromPath(path)

        if (ns.isLaravel) {
            editor.edit(eb => {
                eb.replace(new vscode.Position(editor.selection.active.line, 0), "namespace " + ns.ns + ";");
            })
        }
        else {
            editor.edit(eb => {
                eb.replace(new vscode.Position(editor.selection.active.line, 0), "namespace " + nsVendor + ns.ns + ";");
            })
        }
    });

    context.subscriptions.push(disposable);

    let disposable1 = vscode.commands.registerCommand('phpcompanion.generate_class', function () {

        let editor = vscode.window.activeTextEditor;
        let path = editor.document.fileName;

        let nsVendor = "";

        let config = vscode.workspace.getConfiguration('phpcompanion');

        if (config.has('vendor')) {
            if (config.get('vendor') && config.get('vendor').length > 1) {
                nsVendor = config.get('vendor');
            }
        }

        editor.edit(eb => {
            eb.replace(new vscode.Position(editor.selection.active.line, 0), utils.generateCode(path, "class", nsVendor));
        })

    });

    context.subscriptions.push(disposable1)


    let disposable2 = vscode.commands.registerCommand('phpcompanion.generate_interface', function () {

        let editor = vscode.window.activeTextEditor;
        let path = editor.document.fileName;

        let nsVendor = "";

        let config = vscode.workspace.getConfiguration('phpcompanion');

        if (config.has('vendor')) {
            if (config.get('vendor') && config.get('vendor').length > 1) {
                nsVendor = config.get('vendor');
            }
        }

        editor.edit(eb => {
            eb.replace(new vscode.Position(editor.selection.active.line, 0), utils.generateCode(path, "interface", nsVendor));
        })

    });

    context.subscriptions.push(disposable2)

    let disposable3 = vscode.commands.registerCommand('phpcompanion.generate_trait', function () {

        let editor = vscode.window.activeTextEditor;
        let path = editor.document.fileName;

        let nsVendor = "";

        let config = vscode.workspace.getConfiguration('phpcompanion');

        if (config.has('vendor')) {
            if (config.get('vendor') && config.get('vendor').length > 1) {
                nsVendor = config.get('vendor');
            }
        }

        editor.edit(eb => {
            eb.replace(new vscode.Position(editor.selection.active.line, 0), utils.generateCode(path, "trait", nsVendor));
        })

    });

    context.subscriptions.push(disposable3)
}
exports.activate = activate;

function deactivate() { }
exports.deactivate = deactivate;