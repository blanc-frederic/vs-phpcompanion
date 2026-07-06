const { Uri, workspace } = require('vscode')
const path = require('node:path')
const fs = require('node:fs')

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

    let namespace = pathElements.slice(0, -1).map(element => {
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

    const composerFilename = getComposerFileFor(filename)
    const relativeComposer = workspace.asRelativePath(composerFilename)
    const composerDir = (relativeComposer.length <= 13) ? '' : relativeComposer.substring(0, relativeComposer.length - 13)

    const composer = loadJson(composerFilename)
    if (!composer) {
        return defaultVendor
    }

    const relativeFilename = workspace.asRelativePath(filename)
        .replace(path.sep, '/')

    for (let env of ['autoload', 'autoload-dev']) {
        if (composer[env]?.['psr-4']) {
            for (let vendor in composer[env]['psr-4']) {
                let folder = composerDir + composer[env]['psr-4'][vendor]
                if (relativeFilename.startsWith(folder)) {
                    return createVendor(vendor, folder)
                }
            }
        }
    }

    return detectVendor(relativeFilename, composerDir, defaultVendor)
}

function createVendor(vendor, folder) {
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

function detectVendor(relativeFilename, composerDir, defaultVendor) {
    if (relativeFilename.startsWith(composerDir + 'src/')) {
        defaultVendor.startsWith = composerDir + 'src/'
    } else if (relativeFilename.startsWith(composerDir + 'tests/')) {
        defaultVendor.startsWith = composerDir + 'tests/'
    } else if (defaultVendor.namespace !== '' && relativeFilename.startsWith(composerDir + 'app/')) {
        defaultVendor.startsWith = composerDir + 'app/'
    }
    return defaultVendor
}

function loadJson(filename) {
    let content
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
