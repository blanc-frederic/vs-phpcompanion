const { workspace } = require('vscode')

function getConfig(name, defaultValue = '') {
    const config = workspace.getConfiguration('phpcompanion')

    if (config.has(name) && config.get(name) && config.get(name).length > 1) {
        return config.get(name)
    }

    return defaultValue
}

exports.getConfig = getConfig
