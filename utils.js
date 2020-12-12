const path = require('path')
const vscode = require('vscode')

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
        pathElements.length -1
    ).map(pathElement => {
        return pathElement.charAt(0).toUpperCase() + pathElement.slice(1)
    }).join('\\')

    if (nsVendor.length > 0) {
        namespace = nsVendor + '\\' + namespace
    }

    return namespace
}

function generateCode(filePath, prefix = 'class') {
    let namespace = this.getNamespaceFromPath(filePath)
    let className = path.basename(filePath).replace('.php', '')

    return `<?php

declare(strict_types=1);

namespace ${namespace};

${prefix} ${className}
{
}
`
}

exports.getNamespaceFromPath = getNamespaceFromPath
exports.generateCode = generateCode
