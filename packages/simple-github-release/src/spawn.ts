import { spawn as spawnChild } from 'child_process'

/**
 * Spawn child process.
 * @param cmd
 * @param args
 * @returns Output.
 */
export function spawn(cmd: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawnChild(cmd, args, {
      stdio: 'pipe'
    })
    let output = ''
    const onData = (data: Buffer) => {
      output += data.toString()
    }
    const onDone = (error: unknown) => {
      if (error) {
        reject(
          error instanceof Error
            ? error
            : new Error(output.trim())
        )
      } else {
        resolve(output.trim())
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('close', onDone)
    child.on('exit', onDone)
    child.on('error', onDone)
  })
}
