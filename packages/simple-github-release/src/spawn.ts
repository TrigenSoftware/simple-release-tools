import { spawn as spawnChild } from 'child_process'
import { output } from '@simple-libs/child-process-utils'

/**
 * Spawn child process.
 * @param cmd
 * @param args
 * @returns Output.
 */
export async function spawn(cmd: string, args: string[]) {
  return (await output(spawnChild(cmd, args, {
    stdio: 'pipe'
  }))).toString().trim()
}
