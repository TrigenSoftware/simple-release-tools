/* eslint-disable @typescript-eslint/no-explicit-any */
import { findUp } from 'find-up-simple'
import type {
  ReleaserStepsOptions,
  Project,
  GitRepositoryHosting,
  ReleaserOptions
} from '@simple-release/core'

const VARIANTS = [
  '.simple-release.js',
  '.simple-release.mjs',
  '.simple-release.cjs'
]

export interface SimpleReleaseConfig<
  P extends Project = Project,
  G extends GitRepositoryHosting = GitRepositoryHosting
> extends ReleaserStepsOptions<P, G> {
  project?: P
  hosting?: G
  releaser?: Omit<ReleaserOptions, 'project' | 'hosting'>
}

export type SimpleReleaseConfigRequirements = {
  config?: boolean
} & {
  [K in keyof SimpleReleaseConfig]?: boolean
}

type ApplyRequirements<T extends Record<string, any>, R extends Record<string, any>> = {
  [K in keyof T as K extends keyof R ? R[K] extends true ? K : never : never]-?: Exclude<T[K], undefined>
} & {
  [K in keyof T as K extends keyof R ? R[K] extends true ? never : K : K]: T[K]
}

type ApplyConfigRequirement<R extends { config?: boolean }, T> = R extends { config: true }
  ? T
  : T | null

type Result<
  P extends Project = Project,
  G extends GitRepositoryHosting = GitRepositoryHosting,
  R extends SimpleReleaseConfigRequirements = SimpleReleaseConfigRequirements
> = ApplyRequirements<SimpleReleaseConfig<P, G>, R> extends infer C
  ? ApplyConfigRequirement<R, C>
  : never

function validate(target: Record<string, any>, rules: Record<string, any>) {
  for (const [rule, required] of Object.entries(rules)) {
    if (required && target[rule] === undefined) {
      throw new Error(`Faild to load config: '${rule}' is required`)
    }
  }
}

/**
 * Load simple-release config.
 * @param requirements
 * @returns simple-release config
 */
export async function load<
  P extends Project = Project,
  G extends GitRepositoryHosting = GitRepositoryHosting,
  R extends SimpleReleaseConfigRequirements = SimpleReleaseConfigRequirements
>(requirements?: R): Promise<Result<P, G, R>>

export async function load(requirements: Record<string, any> = {}) {
  const {
    config: configRequired,
    ...reqs
  } = requirements

  for (const variant of VARIANTS) {
    const foundPath = await findUp(variant)

    if (foundPath) {
      try {
        const module = await import(foundPath) as SimpleReleaseConfig | { default: SimpleReleaseConfig }
        const config = 'default' in module ? module.default : module

        validate(config, reqs)

        return config
      } catch (err) {
        if (configRequired) {
          throw err
        }

        return null
      }
    }
  }

  if (configRequired) {
    throw new Error('Config not found')
  }

  return null
}

void {
  p: true
}
