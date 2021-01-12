const { commands, Uri, window, workspace } = require('vscode')

class TestsRunner {
    #statusBar
    #process
    #parser
    #provider
    #lastPath = ''

    constructor(statusBar, process, parser, provider) {
        this.#statusBar = statusBar
        this.#process = process
        this.#parser = parser
        this.#provider = provider
    }

    run() {
        const path = this.detectPath()
        if (path === '') {
            window.showErrorMessage('Cannot run tests : no folder selected')
            return
        }

        this.#statusBar.update('running')

        this.#process.run(path, (code) => this.handle(path, code))
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

    async handle(path, code) {
        this.#provider.onDidChangeEmitter.fire(Uri.parse('phpcompanion:Tests'))
        this.#lastPath = path

        const results = this.#parser.scan(this.#process.output)

        if (code !== 0 && !results) {
            this.#statusBar.update('error')
            const action = await window.showErrorMessage('Error running tests', 'Open logs', 'Close')
            if (action === 'Open logs') {
                commands.executeCommand('phpcompanion.openLogs')
            }
            return
        }

        this.#statusBar.update('done', results)
    }
}

exports.TestsRunner = TestsRunner
