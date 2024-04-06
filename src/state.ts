import * as vscode from 'vscode'
import * as argon from './argon'
import { Session } from './session'

export class State {
  private item: vscode.StatusBarItem
  private sessions: Session[] = []

  public context: vscode.ExtensionContext

  public constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -420,
    )
  }

  public show() {
    this.item.command = 'argon.openMenu'
    this.item.text = '$(argon-logo) Argon'
    this.item.show()
  }

  public addSession(session: Session) {
    this.sessions.push(session)
  }

  public removeSession(id: number) {
    this.sessions = this.sessions.filter((session) => session.id !== id)
  }

  public getSessions() {
    return [...this.sessions]
  }

  public cleanup() {
    this.sessions.forEach((session) => {
      console.log(`Stopping session ${session.id}...`)
      argon.stop(session.id)
    })
  }
}
