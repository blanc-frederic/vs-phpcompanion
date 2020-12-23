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
            this.#statusBar.text = `$(beaker) Click to run tests`
            return
        }

        if (state === 'running') {
            this.#statusBar.text = `$(beaker) Running`
            return
        }

        if (state === 'error') {
            this.#statusBar.text = `$(beaker) $(error) Error`
            this.#statusBar.tooltip = 'Click to show error logs'
            this.#statusBar.command = 'phpcompanion.openLogs'
            return
        }

        if (data.failures > 0) {
            this.#statusBar.text = `$(beaker) ${data.assertions} $(error) ${data.failures}`
            this.#statusBar.tooltip = 'Click to show error logs'
            this.#statusBar.command = 'phpcompanion.openLogs'
            return
        }

        this.#statusBar.text = `$(beaker) ${data.assertions} $(pass)`
        this.#statusBar.tooltip = 'Click to run tests again'
    }
}

exports.TestsStatusBar = TestsStatusBar
