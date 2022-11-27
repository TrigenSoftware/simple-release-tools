import {
  option,
  readOptions,
  end
} from 'argue-cli'
import { lilconfig } from 'lilconfig'
import type { Options } from '../index.js'

const defaultOptions: Options = {
  includeTitle: false,
  changelogLocation: 'CHANGELOG.md',
  draft: false,
  prerelease: false,
  auto: false,
  browser: false,
  ci: false
}

function getOptionsFromArgv(): Options {
  const options = readOptions(
    option('includeTitle', Boolean),
    option('remoteUrl', String),
    option('host', String),
    option('changelogLocation', String),
    option('releaseName', String),
    option('draft', Boolean),
    option('prerelease', Boolean),
    option('auto', Boolean),
    option('browser', Boolean),
    option('ci', Boolean)
  )

  end()

  return options
}

async function getOptionsFromConfig() {
  const result = await lilconfig('simple-github-release', {
    searchPlaces: [
      'package.json',
      '.simple-github-release.json',
      '.simple-github-release.js'
    ],
    loaders: {
      '.js': file => import(file)
    }
  }).search()
  const options = result
    ? result.config as Options
    : {}

  return options
}

export async function getOptions(): Promise<Options> {
  return {
    ...defaultOptions,
    ...await getOptionsFromConfig(),
    ...getOptionsFromArgv()
  }
}
