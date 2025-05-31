import type { ReleaserGithubAction } from './releaser.js'

export async function ifReleaseCommit(releaser: ReleaserGithubAction) {
  const {
    gitClient,
    project
  } = releaser
  const message = await gitClient.exec('log', '-1', '--pretty=%B')
  const tags = await project.getTags()

  return tags.length > 0 && message.startsWith('chore(release):')
}
