import { getOctokit } from '@actions/github'
import { load } from '@simple-release/config'
import { ReleaserGithubAction } from '@simple-release/github-action'

const {
  project,
  releaser,
  ...options
} = await load({
  config: true,
  project: true
})

await new ReleaserGithubAction({
  project,
  octokit: getOctokit(process.env.GITHUB_TOKEN!),
  ...releaser
})
  .setOptions(options)
  .runAction()
