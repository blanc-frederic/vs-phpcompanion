const { spawn } = require('child_process')
const { workspace } = require('vscode')

class Process {
    #process
    #error = false
    #output = ''

    storeOutput(stream) {
        this.#output += stream.toString().replace('\r\n', '\n').replace('\r', '\n')
    }

    get output() {
        return this.#output
    }

    run(cwd, callback) {
        this.#output = ''
        this.#error = false

        const config = workspace.getConfiguration('phpcompanion');
        const command = config.get('tests.script', '')
        if (command == '') {
            this.#output = 'Error : no tests script. Please set in settings'
            return
        }

        const args = config.get('tests.scriptArguments', [])
        this.#output = '> ' + command + ' ' + args.join(' ') + '\n\n'

        this.#process = spawn(command, args, { 'cwd': cwd })

        if (!this.#process) {
            this.#output += 'Cannot start process'
            return
        }

        this.#process.stdout.on('data', data => { this.storeOutput(data) })
        this.#process.stderr.on('data', data => { this.storeOutput(data) })

        this.#process.on('error', err => {
            this.#error = true
            this.storeOutput(err.message.replace('ENOENT', ': no such file or directory'))
            callback(1)
        })

        this.#process.on('close', code => {
            if (this.#error) {
                return
            }
            callback(code)
        })
    }
}

exports.Process = Process
