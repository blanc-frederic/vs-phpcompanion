const path = require('path')
const vscode = require('vscode')

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

function askParentFolder() {
    return vscode.window.showOpenDialog({
        prompt: "Select folder where file will be created",
        canSelectFiles: false,
        canSelectFolders: true,
        openLabel: "Create here"
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

function getConfig(name, defaultValue = '') {
    const config = vscode.workspace.getConfiguration('phpcompanion')

    if (config.has(name) && config.get(name) && config.get(name).length > 1) {
        return config.get(name)
    }

    return defaultValue
}

function getNamespaceFromPath(filePath) {
    let nsVendor = getConfig('vendor')
    const pathElements = vscode.workspace.asRelativePath(filePath).split(path.sep)

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
    let className = path.basename(filePath).replace('.php', '')

    if (
        getConfig('detectTestCase', true)
        && category === 'class'
        && className.substring(className.length - 4) === 'Test'
    ) {
        category = 'use PHPUnit\\Framework\\TestCase;\n\n' + category
        className += ' extends TestCase'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + getNamespaceFromPath(filePath) + ';\n\n'
        + category + ' ' + className + '\n'
        + '{\n    \n}\n'
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWith = replaceSelectionWith
