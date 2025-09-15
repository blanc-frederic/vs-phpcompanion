const { Uri, window, workspace } = require('vscode')
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

    interact.ask('Class name').then(name => {
        if (name.toLowerCase().endsWith('.php')) {
            name = name.substring(0, name.length - 4)
        }

        if (name === undefined || name.length < 1) {
            return
        }

        const category = detectCategory(name);
        const filename = folder.fsPath + '/' + name + '.php'

        createNewFile(
            filename,
            generate(name, getNamespaceFromPath(filename), category)
        )
    })
}

function createNewFile(filename, content) {
    const fileUri = Uri.file(filename)

    workspace.fs.stat(fileUri).then(() => {
        window.showErrorMessage(
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

function generate(name, ns, category) {
    let uses = ''
    let extending = ''

    if (category == 'test') {
        category = 'class'
        uses = 'use PHPUnit\\Framework\\TestCase;\n\n'
        extending = ' extends TestCase'
    }

    if (category == 'class' && getOption('class.insertFinal')) {
        category = 'final class'
    }

    return '<?php\n\n'
        + (getOption('class.insertStrict') ? 'declare(strict_types=1);\n\n' : '')
        + 'namespace ' + ns + ';\n\n'
        + uses
        + category + ' ' + name + extending + '\n'
        + '{\n    \n}\n'
}

function detectCategory(name) {
    if (detectSuffix(name, 'class.detectTestCase', 'Test')) {
        return 'test'
    } else if (detectSuffix(name, 'class.detectInterface', 'Interface')) {
        return 'interface'
    } else if (detectSuffix(name, 'class.detectTrait', 'Trait')) {
        return 'trait'
    } else {
        return 'class'
    }
}

function detectSuffix(name, option, suffix) {
    return getOption(option)
        && name !== suffix
        && name.endsWith(suffix)
}

function getOption(option) {
    const config = workspace.getConfiguration('phpcompanion')
    return config.get(option, true)
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWithNamespace = replaceSelectionWithNamespace
