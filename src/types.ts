export interface Options {
  /**
   * Regular expression to find release title in changelog.
   * Must contain capture group, which will be used to detect release version.
   * As fallback, version will read from package.json.
   */
  titleRegExp?: RegExp
  /**
   * Include release title into release notes.
   * @default false
   */
  includeTitle?: boolean
  /**
   * GitHub repository remote url.
   * @default From local environment.
   */
  remoteUrl?: string
  /**
   * Custom API host.
   * @default 'github.com'
   */
  host?: string
  /**
   * Path to read changelog file.
   * @default 'CHANGELOG.md'
   */
  changelogLocation?: string
  /**
   * Release name to create.
   * You able to use some placeholders:
   * - ${tag} - latest git tag name, as fallback will used 'v${version}'
   * - ${version} - version
   * @default '${tag}'
   */
  releaseName?: string
  /**
   * Create release draft.
   * @default false
   */
  draft?: boolean
  /**
   * Create pre-release.
   * @default false
   */
  prerelease?: boolean
  /**
   * Create release with automatically generated notes.
   * Changelog file will be ignored.
   * @default false
   */
  auto?: boolean
  /**
   * Create link to create release in browser.
   * @default !process.env.GITHUB_TOKEN
   */
  browser?: boolean
  /**
   * Do not trigger user interactions.
   * @default false
   */
  ci?: boolean
}

export interface Repository {
  host: string
  owner: string
  project: string
  protocol: string
  remote: string
  repository: string
}

export interface LocalContext {
  repo: Repository
  tag: string
  version: string
  notes: string
}

export interface GitHubClientOptions {
  auth?: string
  repo: Repository
  host?: string
}

export interface GitHubRelease {
  name: string
  tag: string
  notes?: string
  draft?: boolean
  prerelease?: boolean
  auto?: boolean
}
