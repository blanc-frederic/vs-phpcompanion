const { StatusBarAlignment, window } = require('vscode')

class TestsStatusBar {
    #statusBar

    constructor() {
        this.#statusBar = window.createStatusBarItem(StatusBarAlignment.Left)
        this.#statusBar.show()
    }

    update(state, data) {
        this.#statusBar.command = 'phpcompanion.runTests'

        if (!state) {
            this.#statusBar.text = `$(beaker) Launch tests`
            return
        }

        if (state === 'running') {
            this.#statusBar.text = `$(beaker) Running`
            return
        }

        if (state === 'error') {
            this.#statusBar.text = `$(beaker) $(error) Error`
            this.#statusBar.command = 'phpcompanion.openLogs'
            return
        }

        if (data.failures > 0) {
            this.#statusBar.text = `$(beaker) ${data.assertions} $(error) ${data.failures}`
            this.#statusBar.command = 'phpcompanion.openLogs'
            return
        }

        this.#statusBar.text = `$(beaker) ${data.assertions} $(pass)`
    }
}

exports.TestsStatusBar = TestsStatusBar
