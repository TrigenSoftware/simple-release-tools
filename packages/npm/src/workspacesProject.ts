import { join } from 'path'
import {
  type PackageJsonMonorepoProjectOptions,
  type GenericProjectBumpOptions,
  type GetProjectsOptions,
  PackageJsonManifest,
  PackageJsonMonorepoProject
} from '@simple-release/core'
import {
  type PublishOptions,
  publish
} from './publish.js'

export type NpmWorkspacesProjectOptions = Omit<PackageJsonMonorepoProjectOptions, 'getProjects'>

export type NpmWorkspacesProjectBumpOptions = GenericProjectBumpOptions

export type NpmWorkspacesProjectPublishOptions = Omit<PublishOptions, 'workspaces'>

async function* getProjects(options: GetProjectsOptions) {
  const workspaces = (await options.manifest.readManifest()).workspaces as string[] | undefined

  if (workspaces) {
    for (const workspacesPath of workspaces) {
      yield join(workspacesPath, PackageJsonManifest.Filename)
    }
  }
}

/**
 * A npm workspaces based monorepo project that uses package.json for configuration.
 */
export class NpmWorkspacesProject extends PackageJsonMonorepoProject {
  /**
   * Creates a npm workspaces based monorepo project.
   * @param options
   */
  constructor(options: NpmWorkspacesProjectOptions) {
    super({
      ...options,
      getProjects
    })
  }

  override async publish(options: NpmWorkspacesProjectPublishOptions = {}): Promise<void> {
    await publish(this, {
      ...options,
      workspaces: true
    })
  }
}
