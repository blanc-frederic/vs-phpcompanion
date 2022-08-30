const { Uri, window, workspace } = require('vscode')
const { getConfig } = require('./config')
const { getNamespaceFromPath } = require('./namespace')
const interact = require('./interact')

function replaceSelectionWithNamespace() {
    const editor = window.activeTextEditor

    editor.edit(eb => {
        eb.replace(
            editor.selection,
            'namespace ' + getNamespaceFromPath(editor.document.fileName) + ';'
        )
    })
}

function createPHPFile(folder) {
    if (!folder || !folder.fsPath) {
        interact.askFolder().then(folder => {
            if (folder !== undefined) {
                createPHPFile(Uri.parse(folder))
            }
        })
        return
    }

    interact.ask('class name').then((name) => {
        if (name.toLowerCase().endsWith('.php')) {
            name = name.substring(0, name.length -4)
        }

        if (name === undefined || name.length < 1) {
            return
        }

        const filename = folder.fsPath + '/' + name + '.php'

        createNewFile(
            filename,
            generate(name, getNamespaceFromPath(filename))
        )
    })
}

function createNewFile(filename, content) {
    const fileUri = Uri.file(filename)

    workspace.fs.stat(fileUri).then(() => {
        interact.error(
            'File "' + workspace.asRelativePath(fileUri) + '" already exists'
        )
    }, () => {
        workspace.fs.writeFile(fileUri, new TextEncoder().encode(content)
        ).then(() => {
            workspace.openTextDocument(fileUri).then(
                document => window.showTextDocument(document).then(
                    document => interact.moveCursorTo(document.document.lineCount - 3, 4)
                )
            )
        })
    })
}

function generate(name, ns) {
    let category = 'class'
    let uses = ''
    let extending = ''

    if (detectSuffix(name, 'class.detectTestCase', 'Test')) {
        uses = 'use PHPUnit\\Framework\\TestCase;\n\n'
        extending = ' extends TestCase'
    } else if (detectSuffix(name, 'class.detectInterface', 'Interface')) {
        category = 'interface'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + ns + ';\n\n'
        + uses
        + category + ' ' + name + extending + '\n'
        + '{\n    \n}\n'
}

function detectSuffix(name, option, suffix) {
    return getConfig(option, true)
        && name !== suffix
        && name.endsWith(suffix)
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWithNamespace = replaceSelectionWithNamespace
