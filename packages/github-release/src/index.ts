import { Octokit } from '@octokit/rest'
import { parseHostedGitUrl } from '@simple-libs/hosted-git-info'
import {
  type ReleaseCreatorOptions,
  ReleaseCreator
} from '@simple-release/core'

export interface GithubReleaseCreatorOptions {
  /**
   * The GitHub personal access token to authenticate with the GitHub API.
   */
  token: string
  /**
   * The GitHub owner (username or organization) of the repository.
   * If not provided, it will be inferred from the remote URL.
   */
  owner?: string
  /**
   * The GitHub project (repository name) to create releases in.
   * If not provided, it will be inferred from the remote URL.
   */
  project?: string
}

const OK = 200
const noop = () => { /* no-op */ }

/**
 * A class that creates releases on GitHub using the GitHub REST API.
 */
export class GithubReleaseCreator extends ReleaseCreator {
  readonly octokit: Octokit

  /**
   * Creates a new instance of the GitHub release creator.
   * @param options - The options for the GitHub release creator.
   */
  constructor(
    private readonly options: GithubReleaseCreatorOptions
  ) {
    super()

    this.octokit = new Octokit({
      auth: options.token,
      log: {
        debug: noop,
        info: noop,
        warn: noop,
        error: noop
      }
    })
  }

  private async hasRelease(
    owner: string,
    project: string,
    tag: string
  ): Promise<boolean> {
    try {
      const { status } = await this.octokit.rest.repos.getReleaseByTag({
        owner,
        repo: project,
        tag
      })

      return status === OK
    } catch {
      return false
    }
  }

  async create(options: ReleaseCreatorOptions): Promise<void> {
    const {
      project,
      dryRun,
      logger
    } = options
    let {
      owner: githubOwner,
      project: githubProject
    } = this.options
    const { octokit } = this
    const data = await project.getReleaseData()

    if (!githubOwner || !githubProject) {
      const remote = await project.gitClient.getConfig('remote.origin.url')
      const repo = parseHostedGitUrl(remote)

      if (repo) {
        if (!githubOwner) {
          githubOwner = repo.owner
        }

        if (!githubProject) {
          githubProject = repo.project
        }
      }
    }

    for (const releaseData of data) {
      if (await this.hasRelease(githubOwner!, githubProject!, releaseData.nextTag)) {
        logger?.verbose(`Release ${releaseData.nextTag} already exists.`)
        continue
      }

      const params = {
        owner: githubOwner!,
        repo: githubProject!,
        tag_name: releaseData.nextTag,
        name: releaseData.title,
        body: releaseData.notes,
        prerelease: releaseData.isPrerelease
      }

      logger?.verbose(`Creating release with params:\n${JSON.stringify(params, null, 2)}`)

      if (!dryRun) {
        await octokit.rest.repos.createRelease(params)
      }
    }
  }
}
