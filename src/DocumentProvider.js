const { DocumentLink, EventEmitter, Range, Uri } = require('vscode')

class DocumentProvider {
    onDidChangeEmitter = new EventEmitter()

    #process

    constructor(process) {
        this.#process = process
    }

    onDidChange = this.onDidChangeEmitter.event

    provideTextDocumentContent(uri) {
        if (uri.path === 'Tests') {
            if (!this.#process) {
                return ''
            }

            return '\n' + this.#process.getRawOutput();
        }
    }

    provideDocumentLinks(document, token) {
        let links = []

        const content = document.getText().split('\n')
        for (let lineNumber = 0; lineNumber < content.length; lineNumber++) {
            const currentLine = content[lineNumber]

            Array.from(
                currentLine.matchAll(/(?<url>\.{0,2}\/[^(:`\s]+)([(:](?<line>\d+)\)?)?/g)
            ).forEach(element => {
                const linkText = element[0]
                const position = currentLine.indexOf(linkText)
                const uriAdjust = element.groups.line ? { fragment: (element.groups.line - 1) } : {}

                const linkRange = new Range(lineNumber, position, lineNumber, position + linkText.length)
                const linkTarget = Uri.file(element.groups.url).with(uriAdjust)

                links.push(new DocumentLink(linkRange, linkTarget))
            });
        }

        return links
    }
}

exports.DocumentProvider = DocumentProvider
