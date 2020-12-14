const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const config = require('config')

function getNamespaceFromPath(filename) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filename)).uri.fsPath
    const composerFile = workspaceFolder + path.sep + config.getConfig('composerJson')
    let relativeFilename = vscode.workspace.asRelativePath(filename)

    const content = fs.readFileSync(composerFile)
    const sources = ['autoload', 'autoload-dev']
    const composer = JSON.parse(content)

    let nsVendor = config.getConfig('vendor')

    for (const s in sources) {
        const env = sources[s]

        if (composer[env] && composer[env]['psr-4']) {
            let folder = composer[env]['psr-4']

            for (const vendor in folder) {
                if (relativeFilename.startsWith(folder[vendor])) {
                    nsVendor = vendor
                    if (nsVendor.endsWith('\\')) {
                        nsVendor = nsVendor.substr(0, nsVendor.length -1)
                    }
                    relativeFilename = relativeFilename.substr(folder[vendor].length)
                }
            }
        }
    }

    const pathElements = relativeFilename.split(path.sep)

    if (pathElements.length < 2) {
        return nsVendor
    }

    let startIndex = 0

    if (pathElements[0] === 'src' || pathElements[0] === 'tests') {
        startIndex = 1;
    } else if (nsVendor === '' && pathElements[0] === 'app') {
        nsVendor = 'App';
        startIndex = 1;
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

exposts.getNamespaceFromPath = getNamespaceFromPath
