import * as vscode from 'vscode'

const outputChannel = vscode.window.createOutputChannel('Argon')
outputChannel.appendLine('Argon started')

export function info(message: string) {
  outputChannel.appendLine(message)
  vscode.window.showInformationMessage(`Argon: ${message}`)
}

export function warn(message: string) {
  outputChannel.appendLine(message)
  vscode.window.showWarningMessage(`Argon: ${message}`)
}

export function error(message: string) {
  outputChannel.appendLine(message)
  vscode.window.showErrorMessage(`Argon: ${message}`)
}
