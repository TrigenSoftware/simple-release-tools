import {
  type GitCommitParams,
  type GitTagParams,
  ConventionalGitClient
} from '@conventional-changelog/git-client'
import {
  type Project,
  MonorepoProject
} from './project/index.js'
import { type ReleaseCreator } from './release/index.js'
import { Logger } from './logger.js'

export interface ReleaserOptions {
  dryRun?: boolean
  silent?: boolean
  logger?: Logger
}

export type ReleaserCommitOptions = Omit<GitCommitParams, 'verify' | 'files' | 'message'>

export type ReleaserTagOptions = Omit<GitTagParams, 'name' | 'message'>

/**
 * A releaser class that provides methods to manage the release process of a project.
 */
export class Releaser<P extends Project = Project> {
  /**
   * The git client used to interact with the repository.
   */
  gitClient: ConventionalGitClient
  /**
   * The logger used to log messages during the release process.
   */
  logger: Logger
  private readonly queue: (() => Promise<unknown>)[] = []
  private readonly isMonorepo: boolean

  /**
   * Creates a project releaser.
   * @param project
   * @param options
   */
  constructor(
    public project: P,
    public options: ReleaserOptions = {}
  ) {
    this.gitClient = project.gitClient
    this.logger = options.logger ?? new Logger(options)
    this.isMonorepo = project instanceof MonorepoProject
  }

  /**
   * Enqueue a task to bump the version of the project.
   * @param options
   * @returns Project releaser instance for chaining.
   */
  bump(options?: Omit<Parameters<P['bump']>[0], 'dryRun' | 'logger'>) {
    this.queue.push(async () => {
      const { isMonorepo } = this
      const { dryRun } = this.options
      const logger = this.logger.createChild('bump')

      logger.info(`Bumping version${isMonorepo ? 's' : ''}...`)

      const done = await this.project.bump({
        dryRun,
        logger,
        ...options
      })

      if (!done) {
        logger.info(`No version${isMonorepo ? 's' : ''} changes detected.`)
      }
    })

    return this
  }

  /**
   * Enqueue a task to commit bump changes to the repository.
   * @param options
   * @returns Project releaser instance for chaining.
   */
  commit(options?: ReleaserCommitOptions) {
    this.queue.push(async () => {
      const { dryRun } = this.options

      this.logger.info('commit', `Committing changes...`)

      const files = this.project.changedFiles
      const params = {
        ...options,
        message: this.project.getCommitMessage(),
        verify: false
      }

      this.logger.verbose('commit', `Files to commit:`)

      files.forEach((file) => {
        this.logger.verbose('commit', `- ${file}`)
      })

      this.logger.verbose('commit', `Commit message:\n\n${params.message}`)

      if (!dryRun) {
        await this.gitClient.add(files)
        await this.gitClient.commit(params)
      }
    })

    return this
  }

  /**
   * Enqueue a task to tag the project with the new version.
   * @param options
   * @returns Project releaser instance for chaining.
   */
  tag(options?: ReleaserTagOptions) {
    this.queue.push(async () => {
      const { isMonorepo } = this
      const { dryRun } = this.options

      this.logger.info('tag', `Tagging version${isMonorepo ? 's' : ''}...`)

      const tags = await this.project.getTags()

      if (!tags.length) {
        this.logger.info('tag', `No version${isMonorepo ? 's' : ''} changes detected.`)

        return
      }

      this.logger.verbose('tag', `Tags to create:`)

      for (const tag of tags) {
        this.logger.verbose('tag', `- ${tag}`)

        if (!dryRun) {
          await this.gitClient.tag({
            ...options,
            name: tag
          })
        }
      }
    })

    return this
  }

  /**
   * Enqueue a task to push changes to the remote repository.
   * @param branch - The branch to push changes to. If not provided, the default branch will be used.
   * @returns Project releaser instance for chaining.
   */
  push(branch?: string) {
    this.queue.push(async () => {
      const { dryRun } = this.options
      const targetBranch = branch || await this.gitClient.getDefaultBranch()

      this.logger.info('push', `Pushing changes to ${targetBranch}...`)

      if (!dryRun) {
        await this.gitClient.push(targetBranch, {
          verify: false
        })
        await this.gitClient.push(targetBranch, {
          tags: true,
          verify: false
        })
      }
    })

    return this
  }

  /**
   * Enqueue a task to publish the project.
   * @param options
   * @returns Project releaser instance for chaining.
   */
  publish(options?: Omit<Parameters<P['publish']>[0], 'dryRun' | 'logger'>) {
    this.queue.push(async () => {
      const { isMonorepo } = this
      const { dryRun } = this.options
      const logger = this.logger.createChild('package')

      logger.info(`Publishing project${isMonorepo ? 's' : ''}...`)

      await this.project.publish({
        dryRun,
        logger,
        ...options
      })
    })

    return this
  }

  /**
   * Enqueue a task to create a release.
   * @param releaseCreator - The release creator instance to use.
   * @returns Project releaser instance for chaining.
   */
  release(releaseCreator: ReleaseCreator) {
    this.queue.push(async () => {
      const { isMonorepo } = this
      const { dryRun } = this.options
      const logger = this.logger.createChild('release')

      logger.info(`Creating release${isMonorepo ? 's' : ''}...`)

      await releaseCreator.create({
        project: this.project,
        dryRun,
        logger
      })
    })

    return this
  }

  /**
   * Run all queued tasks in order.
   */
  async run() {
    for (const fn of this.queue) {
      await fn()
    }

    this.queue.length = 0
    this.logger.info('done', `Done!`)
  }
}
