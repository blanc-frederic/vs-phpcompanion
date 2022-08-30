const { workspace } = require('vscode')

function getConfig(name, defaultValue = '') {
    const config = workspace.getConfiguration('phpcompanion')

    if (config.has(name)) {
        return config.get(name)
    }

    return defaultValue
}

exports.getConfig = getConfig
