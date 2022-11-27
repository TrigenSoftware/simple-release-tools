import { describe, it, expect } from 'vitest'
import { getRemoteUrl, parseGitUrl } from './git.js'

describe('git', () => {
  describe('getRemoteUrl', () => {
    it('should get remote url', async () => {
      expect(['git@github.com:TrigenSoftware/simple-github-release.git', 'https://github.com/TrigenSoftware/simple-github-release']).toContain(await getRemoteUrl())
    })
  })

  describe('parseGitUrl', () => {
    it('should parse git url', () => {
      expect(parseGitUrl('git@github.com:TrigenSoftware/simple-github-release.git')).toEqual({
        host: 'github.com',
        owner: 'TrigenSoftware',
        project: 'simple-github-release',
        protocol: 'ssh',
        remote: 'git@github.com:TrigenSoftware/simple-github-release.git',
        repository: 'TrigenSoftware/simple-github-release'
      })
    })
  })
})
