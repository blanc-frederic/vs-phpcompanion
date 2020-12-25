
class PHPUnitParser {
    scan(output) {
        const resultats = output
            .split('\n')
            .map(
                value => value.match(/Tests: (\d+).*, Assertions: (\d+).*, (Failures|Errors): (\d+)/)
                    || value.match(/OK \((\d+) tests, (\d+) assertions\)/)
            )
            .filter(value => value !== null)
            .pop()

        if (!resultats || resultats.length < 3) {
            return
        }

        return {
            'tests': resultats[1],
            'assertions': resultats[2],
            'failures': resultats[4] ? resultats[4] : 0
        }
    }
}

exports.PHPUnitParser = PHPUnitParser
