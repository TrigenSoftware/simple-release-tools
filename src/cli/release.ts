import {
  Options,
  LocalContext,
  GitHubRelease
} from '../index.js'

export function getReleaseData(options: Options, context: LocalContext): GitHubRelease {
  return {
    name: options.releaseName
      ? options.releaseName
        .replace('${tag}', context.tag)
        .replace('${version}', context.version)
      : context.tag,
    tag: context.tag,
    notes: context.notes,
    draft: options.draft,
    prerelease: options.prerelease,
    auto: options.auto
  }
}
