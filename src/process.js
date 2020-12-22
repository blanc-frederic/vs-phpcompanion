const child_process = require('child_process')
const { resolve } = require('path')

class Process
{
    #process
    #output = ''

    scanOutput()
    {
        const resultats = this.#output
            .split('\n')
            .map(
                value => value.match(/Tests: (\d+).*, Assertions: (\d+).*, Failures: (\d+)/)
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
            'failures': resultats[3] ? resultats[3] : 0
        }
    }

    getRawOutput()
    {
        return this.#output
    }

    run(cwd, callback)
    {
        if (this.#process) {
            return
        }

        this.#output = ''

        this.#process = child_process.spawn(
            'bin/phpunit',
            ['--verbose', '--colors=never'],
            { 'cwd': cwd }
        )

        if (! this.#process) {
            return
        }

        this.#process.stdout.on('data', data => {
            this.#output += data.toString().replace('\r\n', '\n').replace('\r', '\n')
        })
        this.#process.stderr.on('data', data => {
            this.#output += data.toString().replace('\r\n', '\n').replace('\r', '\n')
        })
        this.#process.on('error', err => callback(1, resolve(err.message)))
        this.#process.on('close', code => {
            let resultats = { 'tests': 0, 'assertions': 0 }
            try {
                resultats = this.scanOutput()
            } catch (exception) {
                if (code > 0) {
                    resultats = exception
                }
            }
            callback(code, resultats)
        })
    }

    kill()
    {
        if (! this.#process) {
            return false
        }

        this.#process.kill()

        if (! this.#process.killed) {
            return false
        }

        this.#output = ''
        this.#process = null
        return true
    }
}

exports.Process = Process
