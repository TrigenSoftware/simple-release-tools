import { getOctokit } from '@actions/github'
import { load } from '@simple-release/config'
import { ReleaserGithubAction, ifReleaseCommit } from '@simple-release/github-action'

const {
  project,
  releaser,
  ...options
} = await load({
  config: true,
  project: true
})
// await new ReleaserGithubAction({
//   project,
//   octokit: getOctokit(process.env.GITHUB_TOKEN!),
//   ...releaser
// })
//   .setOptions(options)
//   .runPullRequestAction()
const r = new ReleaserGithubAction({
  project,
  octokit: getOctokit(process.env.GITHUB_TOKEN!),
  ...releaser
})
  .setOptions(options)

console.log({
  ifReleaseCommit: await ifReleaseCommit(r)
})

await r.runPullRequestAction()
