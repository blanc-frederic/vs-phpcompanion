const { Position, Selection, window } = require('vscode')

/**
 * @return {Thenable}
 */
function askFolder() {
    return window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true
    })
}

/**
 * @param {string} subject
 * @return {Thenable}
 */
function ask(subject) {
    return window.showInputBox({
        prompt: subject
    })
}

/**
 * @param {int} line
 * @param {int} character
 */
function moveCursorTo(line, character = 0) {
    const pos = new Position(line, character)

    window.activeTextEditor.selections = [
        new Selection(pos, pos)
    ]
}

exports.askFolder = askFolder
exports.ask = ask
exports.moveCursorTo = moveCursorTo
