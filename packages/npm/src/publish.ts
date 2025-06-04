import { spawn } from 'child_process'
import { throwProcessError } from '@simple-libs/child-process-utils'
import {
  type ProjectPublishOptions,
  type PackageJsonProject
} from '@simple-release/core'

export interface PublishOptions extends ProjectPublishOptions {
  access?: string
  tag?: string | ((version: string, prerelease: readonly (string | number)[] | null) => string)
  otp?: string
  env?: Record<string, string | undefined>
  workspaces?: boolean
}

export async function publish(project: PackageJsonProject, options: PublishOptions = {}): Promise<void> {
  const { manifest } = project
  const {
    access,
    tag,
    otp,
    env = process.env,
    workspaces,
    dryRun,
    logger
  } = options
  const silent = logger?.parent.options.silent
  const publishTag = typeof tag === 'function'
    ? tag(
      await manifest.getVersion(),
      await manifest.getPrereleaseVersion()
    )
    : tag

  await throwProcessError(spawn(
    'npm',
    [
      'publish',
      ...access ? ['--access', access] : [],
      ...publishTag ? ['--tag', publishTag] : [],
      ...workspaces ? ['--workspaces'] : [],
      ...dryRun ? ['--dry-run'] : [],
      ...otp ? ['--otp', otp] : []
    ],
    {
      cwd: manifest.projectPath,
      env,
      stdio: silent ? 'ignore' : 'inherit'
    }
  ))
}
