import { join } from 'path'
import {
  describe,
  it,
  expect
} from 'vitest'
import { packageJsonProject } from 'test'
import {
  type LoggerMessage,
  PackageJsonProject,
  Logger
} from '@simple-release/core'
import { GithubReleaseCreator } from './index.js'

describe('github-release', () => {
  describe('GithubReleaseCreator', () => {
    it('should run smoke test', async () => {
      const path = await packageJsonProject()
      const project = new PackageJsonProject({
        path: join(path, 'package.json')
      })
      const log: LoggerMessage[] = []
      const logger = new Logger({
        verbose: true,
        printer(message) {
          log.push(message)
        }
      })
      const publusher = new GithubReleaseCreator({
        token: ''
      })

      await publusher.create({
        project,
        dryRun: true,
        logger: logger.createChild('release')
      })

      const message = log[0].message
      const json = message.slice(message.indexOf('{'))
      const release = JSON.parse(json)

      expect(release).toEqual({
        owner: 'TrigenSoftware',
        repo: 'test-repo',
        tag_name: 'v2.0.0',
        name: 'v2.0.0',
        body: 'RELEASE NOTES',
        prerelease: false
      })
    })
  })
})
