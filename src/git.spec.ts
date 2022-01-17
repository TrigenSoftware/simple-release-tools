import { getRemoteUrl, parseGitUrl } from './git'

describe('git', () => {
  describe('getRemoteUrl', () => {
    it('should get remote url', async () => {
      expect(await getRemoteUrl()).toBe('git@github.com:TrigenSoftware/simple-github-release.git')
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
