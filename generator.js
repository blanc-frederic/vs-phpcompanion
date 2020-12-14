const path = require('path')
const vscode = require('vscode')
const config = require('config')
const namespace = require('./namespace')

function createPHPFile(category, folder) {
    if (!folder || !folder.fsPath) {
        askParentFolder().then(folder => {
            if (folder !== undefined) {
                createPHPFile(category, vscode.Uri.parse(folder))
            }
        })
        return
    }

    vscode.window.showInputBox({
        prompt: category + ' name'
    }).then((name) => {
        if (name === undefined || name.length < 1) {
            return
        }

        const fileName = vscode.Uri.file(folder.fsPath + '/' + name + '.php')

        vscode.workspace.fs.stat(fileName).then(() => {
            vscode.window.showErrorMessage(
                'File "' + vscode.workspace.asRelativePath(fileName) + '" already exists'
            )
        }, error => {
            vscode.workspace.fs.writeFile(fileName, new TextEncoder().encode(
                generate(category, fileName.fsPath)
            )).then(() => {
                vscode.workspace.openTextDocument(fileName).then(
                    document => vscode.window.showTextDocument(document)
                )
            })
        })
    })
}

function replaceSelectionWithNamespace() {
    const editor = vscode.window.activeTextEditor

    editor.edit(eb => {
        eb.replace(
            editor.selection,
            'namespace ' + namespace.getNamespaceFromPath(editor.document.fileName) + ';'
        )
    })
}

function askParentFolder() {
    return vscode.window.showOpenDialog({
        prompt: "Select folder where file will be created",
        canSelectFiles: false,
        canSelectFolders: true,
        openLabel: "Create here"
    })
}

function generate(category, filePath) {
    let className = path.basename(filePath).replace('.php', '')

    if (
        config.getConfig('detectTestCase', true)
        && category === 'class'
        && className !== 'Test'
        && className.endsWith('Test')
    ) {
        category = 'use PHPUnit\\Framework\\TestCase;\n\n' + category
        className += ' extends TestCase'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + namespace.getNamespaceFromPath(filePath) + ';\n\n'
        + category + ' ' + className + '\n'
        + '{\n    \n}\n'
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWithNamespace = replaceSelectionWithNamespace
