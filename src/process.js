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

        if (resultats.lenght < 3) {
            return { 'tests': 0, 'assertions': 0 }
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
        this.#process.on('error', err => callback(1, resolve(err.message)))
        this.#process.on('close', code => callback(code, this.scanOutput()))
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
