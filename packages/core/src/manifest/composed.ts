import { ProjectManifest } from './manifest.js'

/**
 * A class that represents a compositon of multiple project manifests.
 * It is used to manage multiple project manifests as a single entity.
 * Information is used from the main manifest, while the sub manifest are also used to update the version.
 */
export class ComposedProjectManifest<T = Record<string, unknown>> extends ProjectManifest<T> {
  /**
   * Creates a new instance of the composed project manifest.
   * @param mainManifest - The main project manifest to use for reading information.
   * @param subManifests - The sub project manifest to use for writing information.
   */
  constructor(
    public mainManifest: ProjectManifest<T>,
    public subManifests: ProjectManifest[]
  ) {
    super(mainManifest.manifestPath)
  }

  readManifest(): Promise<T> {
    return this.mainManifest.readManifest()
  }

  get contents() {
    return this.mainManifest.contents
  }

  get manifest() {
    return this.mainManifest.manifest
  }

  async getName() {
    return this.mainManifest.getName()
  }

  getVersion() {
    return this.mainManifest.getVersion()
  }

  isPrivate() {
    return this.mainManifest.isPrivate()
  }

  async writeVersion(version: string, dryRun?: boolean) {
    const update = await this.mainManifest.writeVersion(version, dryRun)

    for (const adapter of this.subManifests) {
      update.files.push(...(await adapter.writeVersion(version, dryRun)).files)
    }

    return update
  }
}
