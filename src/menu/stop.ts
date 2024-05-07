import * as vscode from 'vscode'
import * as argon from '../argon'
import { Item } from '.'
import { State } from '../state'

export const item: Item = {
  label: '$(stop) Stop',
  description: 'Stop running Argon sessions',
  action: 'stop',
}

export async function handler(state: State): Promise<void> {
  return new Promise((resolve, reject) => {
    const items = state.getSessions().map((session) => {
      if (session.type === 'Serve') {
        var label = `${session.project} [${session.type} - ${session.address}]`
      } else {
        var label = `${session.project} [${session.type}]`
      }

      return { label, id: session.id }
    })

    if (items.length === 0) {
      return vscode.window.showQuickPick([], {
        title: 'No sessions to stop',
      })
    }

    vscode.window
      .showQuickPick(items, {
        title: 'Select a session to stop',
        canPickMany: items.length > 1,
      })
      .then((item: any) => {
        if (!item) {
          return reject()
        }

        if (Array.isArray(item)) {
          var items = item
        } else {
          var items = [item]
        }

        const ids = items.map((item) => item.id)

        if (ids.length !== 0) {
          argon.stop(ids)
          state.removeSessions(ids)
        }

        resolve()
      })
  })
}
