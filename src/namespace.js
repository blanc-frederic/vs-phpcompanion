const { Uri, workspace } = require('vscode')
const path = require('path')
const fs = require('fs')

function getNamespaceFromPath(filename) {
    let vendorData = getNamespaceFromComposer(filename)

    let relativeFilename = workspace.asRelativePath(filename).replace(path.sep, '/')

    if (vendorData.startsWith.length > 0) {
        relativeFilename = relativeFilename.substring(vendorData.startsWith.length)
    }

    const pathElements = relativeFilename.split('/')
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

function getComposerFileFor(filename) {
    const config = workspace.getConfiguration('phpcompanion');
    const configComposer = config.get('class.composerJson', null)
    if (! configComposer || configComposer.length < 1) {
        return null
    }

    const workspaceFolder = workspace.getWorkspaceFolder(Uri.file(filename)).uri.fsPath
    return workspaceFolder + path.sep + configComposer
}

function getNamespaceFromComposer(filename) {
    const config = workspace.getConfiguration('phpcompanion');
    let defaultVendor = {
        'namespace': config.get('class.vendor', ''),
        'startsWith': ''
    }

    const composer = loadJson(getComposerFileFor(filename))
    if (!composer) {
        return defaultVendor
    }

    const relativeFilename = workspace.asRelativePath(filename)
        .replace(path.sep, '/')

    const sources = ['autoload', 'autoload-dev']
    for (let index = 0; index < sources.length; index++) {
        const env = sources[index]

        if (composer[env] && composer[env]['psr-4']) {
            for (let vendor in composer[env]['psr-4']) {
                let folder = composer[env]['psr-4'][vendor]

                if (relativeFilename.startsWith(folder)) {
                    if (vendor.endsWith('\\')) {
                        vendor = vendor.substring(0, vendor.length - 1)
                    }

                    if (!folder.endsWith('/')) {
                        folder += '/'
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
    if (!json) {
        return null
    }

    return json
}

exports.getNamespaceFromPath = getNamespaceFromPath
