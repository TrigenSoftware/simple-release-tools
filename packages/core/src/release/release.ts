import { Project } from '../project/project.js'
import { type ChildLogger } from '../logger.js'

export interface ReleaseCreatorOptions {
  project: Project
  dryRun?: boolean
  logger?: ChildLogger
}

export interface ReleaseData {
  version: string
  title: string
  notes: string
  previousTag: string
  nextTag: string
  isPrerelease: boolean
}

/**
 * A class that represents a generic release creator.
 */
export abstract class ReleaseCreator {
  /**
   * Creates a new release for the given project.
   * @param options
   */
  abstract create(options: ReleaseCreatorOptions): Promise<void>
}
