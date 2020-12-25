const child_process = require('child_process')
const { getConfig } = require('./config')

class Process {
    #process
    #error = false
    #output = ''

    storeOutput(stream) {
        this.#output += stream.toString().replace('\r\n', '\n').replace('\r', '\n')
    }

    scanOutput() {
        const resultats = this.#output
            .split('\n')
            .map(
                value => value.match(/Tests: (\d+).*, Assertions: (\d+).*, (Failures|Errors): (\d+)/)
                    || value.match(/OK \((\d+) tests, (\d+) assertions\)/)
            )
            .filter(value => value !== null)
            .pop()

        if (!resultats || resultats.length < 3) {
            throw 'cannot read command results'
        }

        return {
            'tests': resultats[1],
            'assertions': resultats[2],
            'failures': resultats[4] ? resultats[4] : 0
        }
    }

    get output() {
        return this.#output
    }

    run(cwd, callback) {
        this.#output = ''
        this.#error = false

        const command = getConfig('tests.script', '')
        if (command == '') {
            this.#output = 'Error : no tests script. Please set in settings'
            return
        }

        const args = getConfig('tests.scriptArguments', [])
        this.#output = '> ' + command + ' ' + args.join(' ') + '\n\n'

        this.#process = child_process.spawn(command, args, { 'cwd': cwd })

        if (!this.#process) {
            this.#output += 'Cannot start process for tests script'
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

            let resultats = null
            try {
                resultats = this.scanOutput()
            } catch (exception) {
            }

            callback(code, resultats)
        })
    }

    kill() {
        if (!this.#process) {
            return false
        }

        this.#process.kill()

        if (!this.#process.killed) {
            return false
        }

        this.#output = ''
        this.#error = null
        this.#process = null
        return true
    }
}

exports.Process = Process
