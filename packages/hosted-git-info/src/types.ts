export type HostType = 'github' | 'gitlab' | 'bitbucket' | 'sourcehut' | ''

export interface HostedGitInfo {
  url: string
  type: HostType
  host: string
  owner?: string
  project?: string
}
