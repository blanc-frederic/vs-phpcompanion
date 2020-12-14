const path = require('path')
const vscode = require('vscode')
const config = require('./config')
const namespace = require('./namespace')
const interact = require('./interact')

function replaceSelectionWithNamespace() {
    const editor = vscode.window.activeTextEditor

    editor.edit(eb => {
        eb.replace(
            editor.selection,
            'namespace ' + namespace.getNamespaceFromPath(editor.document.fileName) + ';'
        )
    })
}

function createPHPFile(category, folder) {
    if (!folder || !folder.fsPath) {
        interact.askFolder().then(folder => {
            if (folder !== undefined) {
                createPHPFile(category, vscode.Uri.parse(folder))
            }
        })
        return
    }

    interact.ask(category + ' name').then((name) => {
        if (name === undefined || name.length < 1) {
            return
        }

        const filename = folder.fsPath + '/' + name + '.php'

        createNewFile(filename, generate(
            category,
            name,
            namespace.getNamespaceFromPath(filename)
        ))
    })
}

function createNewFile(filename, content)
{
    const fileUri = vscode.Uri.file(filename)

    vscode.workspace.fs.stat(fileUri).then(() => {
        interact.error(
            'File "' + vscode.workspace.asRelativePath(fileUri) + '" already exists'
        )
    }, () => {
        vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(content)
        ).then(() => {
            vscode.workspace.openTextDocument(fileUri).then(
                document => vscode.window.showTextDocument(document).then(
                    document => interact.moveCursorTo(document.document.lineCount -3, 4)
                )
            )
        })
    })
}

function generate(category, name, ns) {
    if (
        config.getConfig('detectTestCase', true)
        && category === 'class'
        && name !== 'Test'
        && name.endsWith('Test')
    ) {
        category = 'use PHPUnit\\Framework\\TestCase;\n\n' + category
        name += ' extends TestCase'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + ns + ';\n\n'
        + category + ' ' + name + '\n'
        + '{\n    \n}\n'
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWithNamespace = replaceSelectionWithNamespace
