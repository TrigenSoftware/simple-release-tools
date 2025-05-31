import { getOctokit } from '@actions/github'
import {
  type Project,
  type ReleaserOptions,
  Releaser
} from '@simple-release/core'
import {
  type Octokit,
  GithubHosting
} from '@simple-release/github'
import { parseSetOptionsComment } from './comment.js'
import { ifReleaseCommit } from './conditions.js'

export interface ReleaserGithubActionOptions<P extends Project = Project> extends Omit<ReleaserOptions<P, GithubHosting>, 'hosting'> {
  /**
   * The Octokit instance to use for making GitHub API calls.
   */
  octokit: ReturnType<typeof getOctokit>
}

export class ReleaserGithubAction<P extends Project = Project> extends Releaser<P, GithubHosting> {
  declare hosting: GithubHosting

  constructor(
    options: ReleaserGithubActionOptions<P>
  ) {
    super({
      hosting: new GithubHosting({
        octokit: options.octokit as unknown as Octokit
      }),
      ...options
    })
  }

  override checkout(branch?: string) {
    return super.checkout(branch, {
      username: 'github-actions[bot]',
      email: 'github-actions[bot]@users.noreply.github.com',
      fetch: true,
      force: true
    })
  }

  /**
   * Fetches options from the pull request comments.
   * @returns Project releaser instance for chaining.
   */
  fetchOptions() {
    return this.enqueue(async () => {
      const { headBranch } = this.state

      if (!headBranch) {
        throw new Error('Head branch is not set. Please call `checkout` before `fetchParams`.')
      }

      const {
        project,
        hosting,
        logger
      } = this
      const { octokit } = hosting
      const repositoryId = await hosting.getRepositoryId(project)
      const { data: [pr] } = await octokit.rest.pulls.list({
        ...repositoryId,
        head: `${repositoryId.owner}:${headBranch}`,
        state: 'open'
      })
      const { data: comments } = await octokit.rest.issues.listComments({
        ...repositoryId,
        issue_number: pr.number
      })

      for (let i = comments.length - 1; i >= 0; i--) {
        const json = parseSetOptionsComment(comments[i])

        if (json) {
          try {
            const options = JSON.parse(json) as Record<string, unknown>

            logger.verbose('fetch-options', 'Found set-options comment:')
            logger.verbose('fetch-options', json)

            super.setOptions(options)
          } catch (error) {
            logger.verbose('fetch-options', 'Failed to parse parameters comment:')
            logger.verbose('fetch-options', json)
          }

          break
        }
      }
    })
  }

  override push() {
    return super.push({
      force: true
    })
  }

  /**
   * Run all steps to create a pull request.
   */
  async runPullRequestAction() {
    await this
      .checkout()
      .fetchOptions()
      .bump()
      .commit()
      .push()
      .pullRequest()
      .run()
  }

  /**
   * Run all steps to release a new version.
   */
  async runReleaseAction() {
    await this
      .tag()
      .push()
      .release()
      .publish()
      .run(ifReleaseCommit)
  }
}
