import { PackageJsonManifest } from '../manifest/index.js'
import {
  type GenericProjectOptions,
  type GenericProjectPublishOptions,
  GenericProject
} from './project.js'

export interface PackageJsonProjectOptions extends Omit<GenericProjectOptions, 'manifest'> {
  /**
   * Path to the package.json file
   */
  path?: string
}

/**
 * A package.json based project.
 */
export class PackageJsonProject extends GenericProject {
  /**
   * Creates a package.json based project.
   * @param options
   */
  constructor(options: PackageJsonProjectOptions) {
    const { path = PackageJsonManifest.Filename } = options

    super({
      ...options,
      manifest: new PackageJsonManifest(path)
    })
  }

  override publish(_options?: GenericProjectPublishOptions): Promise<void> {
    throw new Error('Publishing a package.json project is not supported')
  }
}
