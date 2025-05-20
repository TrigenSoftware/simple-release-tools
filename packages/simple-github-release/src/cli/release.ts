import type {
  Options,
  LocalContext,
  GitHubRelease
} from '../index.js'

export function getReleaseData(options: Options, context: LocalContext): GitHubRelease {
  const tag = options.tag || context.tag

  return {
    name: options.releaseName
      ? options.releaseName
        .replace('${tag}', tag)
        .replace('${version}', context.version)
      : tag,
    tag,
    notes: context.notes,
    draft: options.draft,
    prerelease: options.prerelease,
    auto: options.auto
  }
}
