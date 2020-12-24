const { commands, Uri, window, workspace } = require('vscode')

class TestsRunner {
    #statusBar
    #process
    #provider
    #lastPath = ''

    constructor(statusBar, process, provider) {
        this.#statusBar = statusBar
        this.#process = process
        this.#provider = provider
    }

    run() {
        const path = this.detectPath()
        if (path === '') {
            window.showErrorMessage('Cannot run tests : no folder selected')
            return
        }

        this.#statusBar.update('running')

        this.#process.run(path, (code, results) => this.handle(path, code, results))
    }

    detectPath() {
        if (window.activeTextEditor) {
            const activeDocumentUri = window.activeTextEditor.document.uri
            const workspaceFolder = workspace.getWorkspaceFolder(activeDocumentUri)

            if (workspaceFolder) {
                return workspaceFolder.uri.fsPath
            }
        }

        if (this.#lastPath !== '') {
            return this.#lastPath
        }

        if (workspace.workspaceFolders[0]) {
            return workspace.workspaceFolders[0].uri.fsPath
        }

        return ''
    }

    async handle(path, code, results) {
        this.#provider.onDidChangeEmitter.fire(Uri.parse('phpcompanion:Tests'))

        if (code !== 0 && typeof results === 'string') {
            this.#statusBar.update('error')
            const action = await window.showErrorMessage('Error running tests', 'Open logs', 'Close')
            if (action === 'Open logs') {
                commands.executeCommand('phpcompanion.openLogs')
            }
            return
        }

        this.#lastPath = path
        this.#statusBar.update('done', results)
    }
}

exports.TestsRunner = TestsRunner
