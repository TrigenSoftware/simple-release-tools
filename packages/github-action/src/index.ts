import {
  getInput,
  setFailed
} from '@actions/core'
import {
  context,
  getOctokit
} from '@actions/github'
import { exec } from '@actions/exec'
import { Releaser } from '@simple-release/core'
import { PnpmWorkspacesProject } from '@simple-release/pnpm'

const {
  owner,
  repo
} = context.repo
const branch = getInput('branch') || 'simple-release'
const token = (getInput('token') || process.env.GITHUB_TOKEN)!

await exec('git', [
  'config',
  '--global',
  'user.email',
  'github-actions[bot]@users.noreply.github.com'
])
await exec('git', [
  'config',
  '--global',
  'user.name',
  'github-actions[bot]'
])

await exec('git', [
  'branch',
  '-D',
  branch
])
await exec('git', [
  'checkout',
  '-b',
  branch
])

const project = new PnpmWorkspacesProject({
  mode: 'fixed'
})
const releaser = new Releaser(project)
  .bump()
  .commit()
const { logger } = releaser

try {
  await releaser.run()
} catch (error) {
  setFailed((error as Error).message)
  throw error
}

if (project.versionUpdates.length) {
  logger.info('push', `Pushing changes to ${branch}...`)

  await exec('git', [
    'push',
    'origin',
    branch,
    '--force'
  ])

  const octokit = getOctokit(token)
  const { data: [pr] } = await octokit.rest.pulls.list({
    owner,
    repo,
    head: `${owner}:${branch}`,
    state: 'open'
  })
  const [title] = project.getCommitMessage().split('\n')
  const body = `
${project.versionUpdates.map(({ name, notes }) => `# ${name}\n\n${notes.trim()}`).join('\n\n')}

---
This PR was generated with [simple-release](https://github.com/TrigenSoftware/simple-release).
`

  if (pr) {
    logger.info('pr', 'Updating existing pull request...')
    await octokit.rest.pulls.update({
      owner,
      repo,
      pull_number: pr.number,
      title,
      body
    })
  } else {
    logger.info('pr', 'Creating existing pull request...')

    const { data: { default_branch } } = await octokit.rest.repos.get({
      owner,
      repo
    })

    await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      base: default_branch,
      head: branch,
      body
    })
  }
}
