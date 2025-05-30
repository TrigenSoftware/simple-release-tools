import {
  isAbsolute,
  join
} from 'path'
import { PackageJsonManifest } from '../manifest/index.js'
import { type GenericProjectPublishOptions } from './project.js'
import { PackageJsonProject } from './packageJson.js'
import {
  type GenericMonorepoProjectOptions,
  type MonorepoMode,
  type GetProjectsOptions,
  GenericMonorepoProject
} from './monorepo.js'

export interface PackageJsonMonorepoProjectOptions extends Omit<GenericMonorepoProjectOptions, 'getProjects' | 'manifest'> {
  mode: MonorepoMode
  /**
   * Root path of the monorepo
   */
  root?: string
  /**
   * Get project manifests in the monorepo.
   */
  getProjects(options: GetProjectsOptions): AsyncIterable<string>
}

/**
 * A package.json based monorepo project.
 */
export class PackageJsonMonorepoProject extends GenericMonorepoProject {
  /**
   * Creates a package.json based monorepo project.
   * @param options
   */
  constructor(options: PackageJsonMonorepoProjectOptions) {
    const {
      root = process.cwd(),
      getProjects
    } = options

    super({
      ...options,
      manifest: new PackageJsonManifest(join(root, PackageJsonManifest.Filename)),
      async* getProjects(options) {
        for await (const path of getProjects(options)) {
          yield new PackageJsonProject({
            path: isAbsolute(path) ? path : join(root, path),
            ...options
          })
        }
      }
    })
  }

  override publish(_options?: GenericProjectPublishOptions): Promise<void> {
    throw new Error('Publishing a package.json monorepo project is not supported')
  }
}
