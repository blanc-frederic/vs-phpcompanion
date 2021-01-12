const { StatusBarAlignment, window } = require('vscode')

class TestsStatusBar {
    #statusBar

    constructor() {
        this.#statusBar = window.createStatusBarItem(StatusBarAlignment.Left)
    }

    changeActionToOpenLogs(reason) {
        this.#statusBar.command = 'phpcompanion.openLogs'
        this.#statusBar.tooltip = reason + '. Click to show tests logs'
        this.#statusBar.show()
    }

    changeActionToRunTests(reason) {
        this.#statusBar.command = 'phpcompanion.runTests'
        this.#statusBar.tooltip = (reason ? reason + '. ' : '') + 'Click to run tests'
        this.#statusBar.show()
    }

    update(state, data) {
        this.changeActionToRunTests()

        if (!state) {
            this.#statusBar.text = `$(beaker) Ready`
            return
        }

        if (state === 'running') {
            this.#statusBar.text = `$(beaker) Running`
            return
        }

        if (state === 'error') {
            this.#statusBar.text = `$(beaker) $(error) Error`
            this.changeActionToOpenLogs('Error running tests')
            return
        }

        if (!data || !data.tests) {
            this.#statusBar.text = `$(beaker) No stats`
            this.changeActionToOpenLogs('Cannot analyse logs')
            return
        }

        if (data.failures > 0) {
            this.#statusBar.text = `$(beaker) ${data.assertions} $(error) ${data.failures}`
            this.changeActionToOpenLogs(`${data.tests} tests, ${data.assertions} assertions, ${data.failures} failures`)
            return
        }

        this.#statusBar.text = `$(beaker) ${data.assertions} $(pass)`
        this.changeActionToRunTests(`${data.tests} tests, ${data.assertions} assertions`)
    }
}

exports.TestsStatusBar = TestsStatusBar
