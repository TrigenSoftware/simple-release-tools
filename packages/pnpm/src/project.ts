import {
  type PackageJsonProjectOptions,
  type GenericProjectBumpOptions,
  PackageJsonProject
} from '@simple-release/core'
import {
  type PublishOptions,
  publish
} from './publish.js'

export type PnpmProjectOptions = PackageJsonProjectOptions

export type PnpmProjectBumpOptions = GenericProjectBumpOptions

export type PnpmProjectPublishOptions = Omit<PublishOptions, 'workspaces'>

/**
 * A pnpm based project that uses package.json for configuration.
 */
export class PnpmProject extends PackageJsonProject {
  override async publish(options: PnpmProjectPublishOptions = {}): Promise<void> {
    await publish(this, options)
  }
}
