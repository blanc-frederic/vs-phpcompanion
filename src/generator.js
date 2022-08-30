const { Uri, window, workspace } = require('vscode')
const { getConfig } = require('./config')
const { getNamespaceFromPath } = require('./namespace')
const interact = require('./interact')

function replaceSelectionWithNamespace() {
    const editor = window.activeTextEditor

    editor.edit(eb => {
        eb.replace(
            editor.selection,
            'namespace ' + getNamespaceFromPath(editor.document.fileName) + ';'
        )
    })
}

function createPHPFile(folder) {
    if (!folder || !folder.fsPath) {
        interact.askFolder().then(folder => {
            if (folder !== undefined) {
                createPHPFile(Uri.parse(folder))
            }
        })
        return
    }

    interact.ask('class name').then((name) => {
        if (name.toLowerCase().endsWith('.php')) {
            name = name.substring(0, name.length -4)
        }

        if (name === undefined || name.length < 1) {
            return
        }

        const filename = folder.fsPath + '/' + name + '.php'

        createNewFile(
            filename,
            generate(name, getNamespaceFromPath(filename))
        )
    })
}

function createNewFile(filename, content) {
    const fileUri = Uri.file(filename)

    workspace.fs.stat(fileUri).then(() => {
        interact.error(
            'File "' + workspace.asRelativePath(fileUri) + '" already exists'
        )
    }, () => {
        workspace.fs.writeFile(fileUri, new TextEncoder().encode(content)
        ).then(() => {
            workspace.openTextDocument(fileUri).then(
                document => window.showTextDocument(document).then(
                    document => interact.moveCursorTo(document.document.lineCount - 3, 4)
                )
            )
        })
    })
}

function generate(name, ns) {
    let category = 'class'
    let uses = ''
    let extending = ''
    let body = ''

    if (detectSuffix(name, 'class.detectTestCase', 'Test')) {
        uses = 'use PHPUnit\\Framework\\TestCase;\n\n'
        extending = ' extends TestCase'

    } else if (detectSuffix(name, 'class.detectInterface', 'Interface')) {
        category = 'interface'

    } else if (detectSuffix(name, 'class.detectSymfonyCommand', 'Command')) {
        uses = 'use Symfony\\Component\\Console\\Command\\Command;\n'
            + 'use Symfony\\Component\\Console\\Input\\InputInterface;\n'
            + 'use Symfony\\Component\\Console\\Output\\OutputInterface;\n\n'
        extending = ' extends Command'
        body = 'protected static $defaultName = \'' + classnameToCommand(name) + '\';\n\n'
            + '    protected function execute(InputInterface $input, OutputInterface $output): int\n'
            + '    {\n'
            + '        \n'
            + '        return Command::SUCCESS;\n'
            + '    }'
    }

    return '<?php\n\n'
        + 'declare(strict_types=1);\n\n'
        + 'namespace ' + ns + ';\n\n'
        + uses
        + category + ' ' + name + extending + '\n'
        + '{\n'
        + '    ' + body + '\n'
        + '}\n'
}

function classnameToCommand(name) {
    return 'app:' + name.substring(0, name.length -7)
        .replace(/(.)([A-Z][a-z]+)/, '$1:$2')
        .replace(/([a-z0-9])([A-Z])/, '$1:$2')
        .toLowerCase()
}

function detectSuffix(name, option, suffix) {
    return getConfig(option, true)
        && name !== suffix
        && name.endsWith(suffix)
}

exports.createPHPFile = createPHPFile
exports.replaceSelectionWithNamespace = replaceSelectionWithNamespace
