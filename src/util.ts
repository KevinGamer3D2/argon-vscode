import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'

export function getArgonPath(): string {
  return path.join(os.homedir(), '.argon')
}

export function getCurrentDir(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}

export function findProjects(dir?: string): string[] {
  dir = dir || getCurrentDir()

  if (!dir) {
    throw new Error('Cannot find projects without a workspace folder open!')
  }

  return fs
    .readdirSync(dir)
    .filter(
      (entry) =>
        entry.endsWith('.project.json') &&
        fs.statSync(path.join(dir!, entry)).isFile(),
    )
}

export function getProjectName(project: string): string {
  if (!path.isAbsolute(project)) {
    let dir = getCurrentDir()

    if (!dir) {
      throw new Error(
        'Cannot get project name without a workspace folder open!',
      )
    }

    project = path.join(dir, project)
  }

  return JSON.parse(fs.readFileSync(project, 'utf8')).name
}
