const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const config = require('./config')

function getNamespaceFromPath(filename) {
    let vendorData = getNamespaceFromComposer(filename)

    let relativeFilename = vscode.workspace.asRelativePath(filename)
    if (vendorData.startsWith.length > 0) {
        relativeFilename = relativeFilename.substr(vendorData.startsWith.length)
    }

    const pathElements = relativeFilename.split(path.sep)
    if (pathElements.length < 2) {
        return vendorData.namespace
    }

    let namespace = pathElements.slice(0, pathElements.length - 1).map(element => {
        return element.charAt(0).toUpperCase() + element.slice(1)
    }).join('\\')

    if (vendorData.namespace === '') {
        return namespace
    }

    if (namespace === '') {
        return vendorData.namespace
    }

    return vendorData.namespace + '\\' + namespace
}

function getComposerFileFor(filename)
{
    const configComposer = config.getConfig('composerJson')
    if (configComposer.length < 1) {
        return null
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filename)).uri.fsPath
    return workspaceFolder + path.sep + configComposer
}

function getNamespaceFromComposer(filename)
{
    let defaultVendor = {
        'namespace': config.getConfig('vendor'),
        'startsWith': ''
    }

    const composer = loadJson(getComposerFileFor(filename))
    if (! composer) {
        return defaultVendor
    }

    const relativeFilename = vscode.workspace.asRelativePath(filename)
        .replace(path.sep, '/')

    const sources = ['autoload', 'autoload-dev']
    for (let index = 0; index < sources.length; index++) {
        const env = sources[index]

        if (composer[env] && composer[env]['psr-4']) {
            for (let vendor in composer[env]['psr-4']) {
                const folder = composer[env]['psr-4'][vendor]

                if (relativeFilename.startsWith(folder)) {
                    if (vendor.endsWith('\\')) {
                        vendor = vendor.substr(0, vendor.length -1)
                    }

                    return {
                        'namespace': vendor,
                        'startsWith': folder
                    }
                }
            }
        }
    }

    if (relativeFilename.startsWith('src/')) {
        defaultVendor.startsWith = 'src/'
    } else if (relativeFilename.startsWith('tests/')) {
        defaultVendor.startsWith = 'tests/'
    } else if (defaultVendor.namespace !== '' && relativeFilename.startsWith('app/')) {
        defaultVendor.startsWith = 'app/'
    }

    return defaultVendor
}

function loadJson(filename) {
    let content = '{}'
    try {
        content = fs.readFileSync(filename)
    } catch {
        return null
    }

    const json = JSON.parse(content)
    if (! json) {
        return null
    }

    return json
}

exports.getNamespaceFromPath = getNamespaceFromPath
