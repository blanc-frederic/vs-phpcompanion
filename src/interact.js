const vscode = require('vscode')

/**
 * @param {string} message
 */
function error(message) {
    vscode.window.showErrorMessage(message)
}

/**
 * @return {Thenable}
 */
function askFolder() {
    return vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true
    })
}

/**
 * @param {string} subject
 * @return {Thenable}
 */
function ask(subject) {
    return vscode.window.showInputBox({
        prompt: subject
    })
}

/**
 * @param {int} line
 * @param {int} character
 */
function moveCursorTo(line, character = 0) {
    const pos = new vscode.Position(line, character)

    vscode.window.activeTextEditor.selections = [
        new vscode.Selection(pos, pos)
    ]
}

exports.error = error
exports.askFolder = askFolder
exports.ask = ask
exports.moveCursorTo = moveCursorTo
