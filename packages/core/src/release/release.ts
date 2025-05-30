import { GenericProject } from '../project/project.js'
import { type ChildLogger } from '../logger.js'

export interface GenericReleaseCreatorOptions {
  project: GenericProject
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
export abstract class GenericReleaseCreator {
  /**
   * Creates a new release for the given project.
   * @param options
   */
  abstract create(options: GenericReleaseCreatorOptions): Promise<void>
}
