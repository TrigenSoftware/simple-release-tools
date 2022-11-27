import open from 'open'
import { GitHubClient } from '../index.js'
import { getOptions } from './options.js'
import { getContext } from './context.js'
import { getReleaseData } from './release.js'
import {
  warn,
  link,
  error
} from './console.js'

void (async () => {
  const { GITHUB_TOKEN } = process.env
  const options = await getOptions()
  const context = await getContext(options)
  const client = new GitHubClient({
    auth: GITHUB_TOKEN,
    repo: context.repo
  })
  const release = getReleaseData(options, context)

  if (!GITHUB_TOKEN || options.browser) {
    const releaseUrl = client.createBrowserReleaseUrl(release)

    if (!options.browser) {
      warn('Environment variable "GITHUB_TOKEN" is required for automated release. Falling back to browser-based release.')
    }

    if (options.ci) {
      link(releaseUrl)
    } else {
      await open(releaseUrl)
      link(client.createReleaseUrl(release))
    }

    return
  }

  const latestRelease = await client.getLatestRelease()
  let releaseUrl: string

  if (latestRelease?.tag === context.tag) {
    ({ releaseUrl } = await client.updateRelease(latestRelease.id, release))
  } else {
    ({ releaseUrl } = await client.createRelease(release))
  }

  link(releaseUrl)
})().catch(error)
