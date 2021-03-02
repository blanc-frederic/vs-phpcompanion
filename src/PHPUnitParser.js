
class PHPUnitParser {
    scan(output) {
        const resultats = output
            .split('\n')
            .map(
                value => value.match(/Tests: (?<tests>\d+)[^,\.]*(, Assertions: (?<assertions>\d+)[^,\.]*)?(, Failures: (?<failures>\d+)[^,\.]*)?(, Errors: (?<errors>\d+)[^,\.]*)?(, Skipped: (?<skipped>\d+)[^,\.]*)?/)
                    || value.match(/(OK )?\((?<tests>\d+) tests?, (?<assertions>\d+) assertions?\)/)
            )
            .filter(value => value !== null)
            .pop()

        if (!resultats || !resultats.groups.tests) {
            return
        }

        let fails = 0
        if (resultats.groups.failures) {
            fails += parseInt(resultats.groups.failures)
        }
        if (resultats.groups.errors) {
            fails += parseInt(resultats.groups.errors)
        }

        return {
            'tests': parseInt(resultats.groups.tests),
            'assertions': parseInt(resultats.groups.assertions),
            'failures': fails
        }
    }
}

exports.PHPUnitParser = PHPUnitParser
