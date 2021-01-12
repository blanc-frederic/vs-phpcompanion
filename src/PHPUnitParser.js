
class PHPUnitParser {
    scan(output) {
        const resultats = output
            .split('\n')
            .map(
                value => value.match(/Tests: (?<tests>\d+).*(, Assertions: (?<assertions>\d+).*)?(, Failures: (?<failures>\d+).*)?(, Errors: (?<errors>\d+).*)?(, Skipped: (?<skipped>\d+))?.*\.$/)
                    || value.match(/OK \((?<tests>\d+) tests, (?<assertions>\d+) assertions\)/)
            )
            .filter(value => value !== null)
            .pop()

        if (!resultats || resultats.tests < 3) {
            return
        }

        let fails = 0
        if (resultats.failures) {
            fails += resultats.failures
        }
        if (resultats.errors) {
            fails += resultats.errors
        }

        return {
            'tests': resultats.tests,
            'assertions': resultats.assertions,
            'failures': fails
        }
    }
}

exports.PHPUnitParser = PHPUnitParser
