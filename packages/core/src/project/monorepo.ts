import semver from 'semver'
import {
  ConventionalGitClient,
  packagePrefix
} from '@conventional-changelog/git-client'
import { type ReleaseData } from '../release/release.js'
import { type ProjectManifest } from '../manifest/index.js'
import {
  type ProjectOptions,
  type ProjectBumpOptions,
  bumpDefaultOptions,
  Project
} from './project.js'

export type MonorepoMode = 'fixed' | 'independent'

export type GetProjectsOptions = Required<Pick<ProjectOptions, 'compose' | 'gitClient' | 'manifest'>>

export interface MonorepoProjectOptions extends ProjectOptions {
  /**
   * The mode of the monorepo.
   * If mode is 'fixed', all projects will be bumped to the same version.
   * If mode is 'independent', each project will be bumped to its own version.
   */
  mode: MonorepoMode
  /**
   * Hook function to compose the manifest.
   * @param manifest - The manifest to compose.
   */
  compose?(manifest: ProjectManifest, isRoot?: boolean): ProjectManifest
  /**
   * Get projects in the monorepo.
   */
  getProjects(options: GetProjectsOptions): AsyncIterable<Project>
  /**
   * Get the scope for the project of monorepo.
   * @param projectName - Project name to get the scope for.
   * @param rootName - The name of the root project.
   * @returns The scope for the project.
   */
  scope?(projectName: string, rootName: string): string | Promise<string>
  /**
   * Get the tag prefix for the project of monorepo.
   * @param scope - The scope name of the project.
   * @returns The tag prefix for the project.
   */
  tagPrefix?(scope: string): string | Promise<string>
  /**
   * The git client used to interact with the repository.
   */
  gitClient?: ConventionalGitClient
}

export interface MonorepoProjectBumpOptions extends Omit<ProjectBumpOptions, 'tagPrefix'> {
  /**
   * Force bump projects without changes in the monorepo with fixed mode.
   */
  force?: boolean
  /**
   * Bump options for specific projects.
   */
  byProject?: Record<string, Pick<ProjectBumpOptions, 'version' | 'as' | 'prerelease' | 'firstRelease'>>
}

export abstract class MonorepoProject extends Project {
  /**
   * The mode of the monorepo.
   * If mode is 'fixed', all projects will be bumped to the same version.
   * If mode is 'independent', each project will be bumped to its own version.
   */
  mode: MonorepoMode
  declare options: MonorepoProjectOptions & ProjectOptions
  private projectsMutex: Promise<Project[]> | undefined

  /**
   * Creates a new instance of the generic monorepo project.
   * @param options - The options to use for the monorepo project.
   */
  constructor(options: MonorepoProjectOptions) {
    const {
      mode,
      compose
    } = options

    super({
      ...options,
      compose: compose
        ? (manifest, isRoot = true) => compose(manifest, isRoot)
        : manifest => manifest
    })

    this.mode = mode
  }

  /**
   * Get the projects in the monorepo.
   * @yields The projects in the monorepo.
   */
  async* getProjects() {
    if (!this.projectsMutex) {
      const {
        compose,
        getProjects
      } = this.options
      const options = {
        compose: (manifest: ProjectManifest) => compose!(manifest, false),
        gitClient: this.gitClient,
        manifest: this.manifest
      }
      const projects: Project[] = []
      let resolve: (projects: Project[]) => void

      this.projectsMutex = new Promise<Project[]>((r) => {
        resolve = r
      })

      for await (const project of getProjects(options)) {
        const isPrivate = await project.manifest.isPrivate()

        if (!isPrivate) {
          projects.push(project)
          yield project
        }
      }

      resolve!(projects)
      return
    }

    yield* await this.projectsMutex
  }

  /**
   * Get scope from project name.
   * @param name - The name of the project.
   * @returns The scope of the project.
   */
  async getScope(name: string) {
    if (this.options.scope) {
      return await this.options.scope(name, await this.manifest.getName())
    }

    return name.replace(/@[^/]+\//, '')
  }

  /**
   * Get tag prefix from scope.
   * @param scope - The scope of the project.
   * @returns The tag prefix for the project.
   */
  async getTagPrefix(scope: string) {
    if (this.options.tagPrefix) {
      return await this.options.tagPrefix(scope)
    }

    if (this.mode === 'fixed') {
      return ''
    }

    return packagePrefix(scope) as string
  }

  private getIndependentCommitMessage() {
    const { versionUpdates } = this

    if (versionUpdates.length === 0) {
      throw new Error('Nothing to commit')
    }

    return `chore(release): monorepo release\n\n${
      versionUpdates
        .map(({ name, to }) => `- ${name}@${to}`)
        .join('\n')
    }`
  }

  override getCommitMessage() {
    const { mode } = this

    if (mode === 'fixed') {
      return super.getCommitMessage()
    }

    return this.getIndependentCommitMessage()
  }

  private async getIndependentTags() {
    const tags: string[] = []

    for await (const project of this.getProjects()) {
      const { manifest } = project
      const name = await manifest.getName()
      const scope = await this.getScope(name)
      const tagPrefix = await this.getTagPrefix(scope)

      tags.push(...await project.getTags({
        tagPrefix
      }))
    }

    return tags
  }

  override async getTags() {
    const { mode } = this

    if (mode === 'fixed') {
      return super.getTags()
    }

    return this.getIndependentTags()
  }

  private async getIndependentReleaseData() {
    const data: ReleaseData[] = []

    for await (const project of this.getProjects()) {
      const { manifest } = project
      const name = await manifest.getName()
      const scope = await this.getScope(name)
      const tagPrefix = await this.getTagPrefix(scope)
      const releaseData = await project.getReleaseData({
        tagPrefix
      })

      data.push(...releaseData.map(data => ({
        ...data,
        title: `${name}: ${data.title}`
      })))
    }

    return data
  }

  override async getReleaseData() {
    const { mode } = this

    if (mode === 'fixed') {
      return super.getReleaseData()
    }

    return this.getIndependentReleaseData()
  }

  private async getBumpOptions(
    project: Project,
    options: MonorepoProjectBumpOptions
  ) {
    const {
      preset = bumpDefaultOptions.preset,
      byProject,
      ...bumpOptions
    } = options
    const { manifest } = project
    const name = await manifest.getName()
    const scope = await this.getScope(name)
    const tagPrefix = await this.getTagPrefix(scope)
    const projectPreset = {
      ...typeof preset === 'string' ? {
        name: preset
      } : preset,
      scope
    }
    const projectBumpOptions = {
      ...bumpOptions,
      ...byProject?.[name],
      preset: projectPreset,
      tagPrefix
    }

    return projectBumpOptions
  }

  override getNextVersion(
    options: MonorepoProjectBumpOptions = {}
  ): Promise<string | null> {
    if (this.mode === 'fixed' && options.version) {
      return super.getNextVersion(options)
    }

    throw new Error(
      'Monorepo project does not support getNextVersion'
    )
  }

  private async independentBump(
    options: MonorepoProjectBumpOptions = {}
  ) {
    let hasBump = false

    for await (const project of this.getProjects()) {
      const projectBumpOptions = await this.getBumpOptions(
        project,
        options
      )

      hasBump = await project.bump(projectBumpOptions) || hasBump

      this.changedFiles.push(
        ...project.changedFiles
      )
      this.versionUpdates.push(
        ...project.versionUpdates
      )
    }

    return hasBump
  }

  private async fixedBump(
    options: MonorepoProjectBumpOptions = {}
  ) {
    const { force } = options
    const updatedProjects: {
      project: Project
      options: MonorepoProjectBumpOptions
    }[] = []
    let hasBump = false
    let fixedVersion: string | undefined

    for await (const project of this.getProjects()) {
      const projectBumpOptions = await this.getBumpOptions(
        project,
        options
      )
      const version = await project.getNextVersion(projectBumpOptions)

      if (version || force) {
        updatedProjects.push({
          project,
          options: projectBumpOptions
        })

        if (version && (!fixedVersion || semver.gt(version, fixedVersion))) {
          fixedVersion = version
        }
      }
    }

    if (fixedVersion) {
      hasBump = await super.bump({
        ...options,
        version: fixedVersion,
        tagPrefix: await this.getTagPrefix('')
      })

      for (const { project, options } of updatedProjects) {
        hasBump = await project.bump({
          ...options,
          version: fixedVersion
        }) || hasBump

        this.changedFiles.push(
          ...project.changedFiles
        )
        this.versionUpdates.push(
          ...project.versionUpdates
        )
      }
    }

    return hasBump
  }

  override async bump(
    options: MonorepoProjectBumpOptions = {}
  ) {
    const { mode } = this

    if (mode === 'fixed') {
      return this.fixedBump(options)
    }

    return this.independentBump(options)
  }
}
