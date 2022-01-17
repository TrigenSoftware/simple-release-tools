import gitUrlParse from 'git-url-parse'
import { Repository } from './types'
import { spawn } from './spawn'

/**
 * Get latest git tag name.
 * @returns Tag name.
 */
export async function getLatestTagName() {
  try {
    return await spawn('git', [
      'describe',
      '--tags',
      '--abbrev=0'
    ])
  } catch (err) {
    return null
  }
}

function getBranchName() {
  try {
    return spawn('git', ['branch', '--show-current'])
  } catch (err) {
    return spawn('git', [
      'rev-parse',
      '--abbrev-ref',
      'HEAD'
    ])
  }
}

function getRemoteForBranch(branch: string) {
  return spawn('git', [
    'config',
    '--get',
    `branch.${branch}.remote`
  ])
}

async function getRemote() {
  const branchName = await getBranchName()
  let remote = 'origin'

  try {
    if (branchName) {
      remote = await getRemoteForBranch(branchName)
    }
  } catch (err) {
    /* Silent */
  }

  return remote
}

function isRemoteName(remoteUrlOrName: string) {
  return Boolean(remoteUrlOrName && !remoteUrlOrName.includes('/'))
}

/**
 * Get git repository remote url.
 * @returns Remote url.
 */
export async function getRemoteUrl() {
  const remoteNameOrUrl = await getRemote()
  let remoteUrl = remoteNameOrUrl

  if (isRemoteName(remoteNameOrUrl)) {
    try {
      remoteUrl = await spawn('git', [
        'remote',
        'get-url',
        remoteNameOrUrl
      ])
    } catch (err) {
      try {
        remoteUrl = await spawn('git', [
          'config',
          '--get',
          `remote.${remoteNameOrUrl}.url`
        ])
      } catch (err) {
        /* Silent */
      }
    }
  }

  return remoteUrl
}

/**
 * Parse git repository info from url.
 * @param remoteUrl - git repository url.
 * @returns Repository info.
 */
export function parseGitUrl(remoteUrl: string): Repository {
  const url = (remoteUrl || '').replace(/\\/g, '/')
  const parsedUrl = gitUrlParse(url)
  const {
    protocol,
    resource: host,
    href: remote,
    owner: parsedOwner,
    name: project
  } = parsedUrl
  const owner = protocol === 'file'
    ? parsedUrl.owner.split('/').pop() ?? ''
    : parsedOwner
  const repository = `${owner}/${project}`

  return {
    host,
    owner,
    project,
    protocol,
    remote,
    repository
  }
}

