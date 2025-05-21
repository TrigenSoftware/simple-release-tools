import {
  describe,
  it,
  expect
} from 'vitest'
import { parseHostedGitUrl } from './hostedGitInfo.js'
import { samples } from './hostedGitInfo.mock.js'

describe('hosted-git-info', () => {
  describe('parseHostedGitUrl', () => {
    it('should parse all samples', () => {
      samples.forEach(([url, data]) => {
        expect(parseHostedGitUrl(url)).toEqual(data)
      })
    })
  })
})
