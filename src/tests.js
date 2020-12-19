const vscode = require('vscode')

let testsStatus
let status = 'none'

function initStatus(subscriptions)
{
    testsStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)

    testsStatus.text = generateTextStatus()
    testsStatus.command = 'phpcompanion.showStatus'
    testsStatus.show()

    subscriptions.push(testsStatus)
    subscriptions.push(vscode.commands.registerCommand(
        'phpcompanion.showStatus',
        () => showStatus()
    ))
}

function showStatus()
{
    vscode.window.showInformationMessage('Status clicked', )
}

function launchTests()
{
    if (status == 'ok') {
        status = 'error'
        testsStatus.text = generateTextStatus(2)
    } else {
        status = 'ok'
        testsStatus.text = generateTextStatus(0)
    }

}

function generateTextStatus(errorCount)
{
    if (errorCount === 0) {
        return `$(beaker) $(pass) OK`
    }

    if (!errorCount) {
        return `$(beaker) Launch tests (F9)`
    }

    return `$(beaker) $(error) ${errorCount} errors`
}

exports.launchTests = launchTests
exports.initStatus = initStatus
exports.showStatus = showStatus