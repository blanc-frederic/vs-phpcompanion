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
                generateCode(fileName, category)
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
        content = generateCode(editor.document.fileName, category)
    }

    editor.edit(eb => {
        eb.replace(editor.selection, content)
    })
}

function getVendor() {
    let config = vscode.workspace.getConfiguration('phpcompanion')

    if (config.has('vendor') && config.get('vendor') && config.get('vendor').length > 1) {
        return config.get('vendor')
    }

    return '';
}

function getNamespaceFromPath(filePath) {
    let nsVendor = getVendor()
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
        namespace = nsVendor + '\\' + namespace
    }

    return namespace
}

function generateCode(filePath, prefix = 'class') {
    let namespace = getNamespaceFromPath(filePath)
    let className = path.basename(filePath).replace('.php', '')

    if (className.substring(className.length - 4) === 'Test' && prefix === 'class') {
        prefix = 'use PHPUnit\\Framework\\TestCase;\n\n' + prefix
        className += ' extends TestCase'
    }

    return `<?php

declare(strict_types=1);

namespace ${namespace};

${prefix} ${className}
{
    
}
`
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWith = replaceSelectionWith
