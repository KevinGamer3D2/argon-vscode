import * as childProcess from 'child_process'
import * as logger from './logger'
import * as config from './config'
import { getCurrentDir } from './util'

function log(data: string, logCallback?: (data: string) => void) {
  let output = undefined

  for (const line of data.trim().split('\n')) {
    const isVerbose = line.endsWith(']')

    if (logCallback && !isVerbose) {
      logCallback(line)
    } else if (line.startsWith('ERROR')) {
      logger.error(line, isVerbose)
    } else if (line.startsWith('WARN')) {
      logger.warn(line, isVerbose)
    } else {
      logger.info(line, isVerbose)
    }

    if (!isVerbose && !output) {
      output = line
    }
  }

  return output
}

async function spawn(args: string[], logCallback?: (data: string) => void) {
  logger.info('Starting new Argon process..', true)

  const process = childProcess.spawn(
    'argon',
    args.concat([
      config.verbose() ? '-vvvv' : '-v',
      '--yes',
      '--color',
      'never',
    ]),
    {
      cwd: getCurrentDir(),
    },
  )

  const firstOutput: string = await new Promise((resolve) => {
    process.stdout?.on('data', (data) => {
      const output = log(data.toString(), logCallback)

      if (output) {
        resolve(output)
      }
    })

    process.stderr?.on('data', (data) => {
      const output = log(data.toString(), logCallback)

      if (output) {
        resolve(output)
      }
    })
  })

  return (process.exitCode === 0 || process.exitCode === null) &&
    !firstOutput.includes('Command execution failed')
    ? Promise.resolve(firstOutput)
    : Promise.reject(firstOutput)
}

export async function serve(
  project: string,
  options: string[],
): Promise<[number, string]> {
  const id = Date.now()
  const message = await spawn(['serve', project, id.toString(), ...options])

  return [id, message]
}

export async function build(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await spawn(['build', project, id.toString(), ...options])
    return id
  }

  await spawn(['build', project, ...options])
}

export async function sourcemap(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await spawn(['sourcemap', project, id.toString(), ...options])
    return id
  }

  await spawn(['sourcemap', project, ...options])
}

export function init(project: string, template: string, options: string[]) {
  spawn(['init', project, '--template', template, ...options])
}

export function stop(ids: number[]) {
  spawn(['stop', ...ids.map((id) => id.toString())])
}

export function debug(mode: string) {
  spawn(['debug', mode])
}

export function exec(code: string, focus?: boolean) {
  const args = focus ? ['--focus'] : []
  spawn(['exec', code, ...args])
}

export function studio(check?: boolean, place?: string) {
  const args = []

  if (place) {
    args.push(place)
  }

  if (check) {
    args.push('--check')
  }

  spawn(['studio', ...args])
}

export function plugin(mode: string) {
  spawn(['plugin', mode])
}

export function update(auto?: boolean) {
  spawn(
    ['update'],
    auto
      ? (data: string) => {
          if (data.includes('is up to date')) {
            logger.info(data, true)
          } else if (data.includes('error trying to connect')) {
            logger.error(data, true)
          } else {
            log(data)
          }
        }
      : undefined,
  )
}

export function version() {
  return childProcess.execSync('argon --version').toString()
}
