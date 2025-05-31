import {
  type PackageJsonProjectOptions,
  type GenericProjectBumpOptions,
  PackageJsonProject
} from '@simple-release/core'
import {
  type PublishOptions,
  publish
} from './publish.js'

export type NpmProjectOptions = PackageJsonProjectOptions

export type NpmProjectBumpOptions = GenericProjectBumpOptions

export type NpmProjectPublishOptions = Omit<PublishOptions, 'workspaces'>

/**
 * A npm based project that uses package.json for configuration.
 */
export class NpmProject extends PackageJsonProject {
  override async publish(options: NpmProjectPublishOptions = {}): Promise<void> {
    await publish(this, options)
  }
}
