const path = require('path')
const vscode = require('vscode')

function createPHPFile(category, folder) {
    if (!folder || !folder.fsPath) {
        return
    }

    vscode.window.showInputBox({ prompt: category + ' name' }).then((basename) => {
        if (basename === undefined || basename.length < 1) {
            return
        }

        const fileName = folder.fsPath + '/' + basename + '.php'

        vscode.workspace.fs.writeFile(
            vscode.Uri.file(fileName),
            new TextEncoder().encode(
                generate(category, fileName)
            )
        ).then(() => {
            vscode.workspace.openTextDocument(fileName).then(
                document => vscode.window.showTextDocument(document)
            )
        })
    })
}

function replaceSelectionWith(category) {
    const editor = vscode.window.activeTextEditor

    let content = ''
    if (category === 'namespace') {
        content = 'namespace ' + getNamespaceFromPath(editor.document.fileName) + ';'
    } else {
        content = generate(category, editor.document.fileName)
    }

    editor.edit(eb => {
        eb.replace(editor.selection, content)
    })
}

function getConfig(name) {
    let config = vscode.workspace.getConfiguration('phpcompanion')

    if (config.has(name) && config.get(name) && config.get(name).length > 1) {
        return config.get(name)
    }

    return '';
}

function getNamespaceFromPath(filePath) {
    let nsVendor = getConfig('vendor')
    let pathElements = vscode.workspace.asRelativePath(filePath).split(path.sep)

    if (pathElements.length < 2) {
        return nsVendor
    }

    let startIndex = 0

    if (pathElements[0] === 'src' || pathElements[0] === 'tests') {
        startIndex = 1;
    } else if (pathElements[0] === 'app') {
        nsVendor = '';
    }

    let namespace = pathElements.slice(
        startIndex,
        pathElements.length - 1
    ).map(pathElement => {
        return pathElement.charAt(0).toUpperCase() + pathElement.slice(1)
    }).join('\\')

    if (nsVendor.length > 0) {
        if (namespace.length > 0) {
            return nsVendor + '\\' + namespace
        } else {
            return nsVendor
        }
    }

    return namespace
}

function generate(category, filePath) {
    let namespace = getNamespaceFromPath(filePath)
    let className = path.basename(filePath).replace('.php', '')

    if (className.substring(className.length - 4) === 'Test' && category === 'class') {
        category = 'use PHPUnit\\Framework\\TestCase;\n\n' + category
        className += ' extends TestCase'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + namespace + '\n\n'
        + category + ' ' + className + '\n'
        + '{\n    \n}\n';
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWith = replaceSelectionWith
