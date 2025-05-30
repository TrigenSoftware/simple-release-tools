import { join } from 'path'
import {
  describe,
  it,
  expect
} from 'vitest'
import fg from 'fast-glob'
import {
  packageJsonIndependentMonorepoProject,
  packageJsonFixedMonorepoProject,
  forkProject
} from 'test'
import type { GetProjectsOptions } from './monorepo.js'
import type { GenericProject } from './project.js'
import { PackageJsonMonorepoProject } from './packageJsonMonorepo.js'

async function* getProjects(options: GetProjectsOptions) {
  yield* (await fg(join(options.manifest.projectPath, 'packages', '**', 'package.json'))).sort()
}

describe('core', () => {
  describe('manifest', () => {
    describe('PackageJsonMonorepoProject', () => {
      describe('independent mode', () => {
        it('should get no tags', async () => {
          const path = await packageJsonIndependentMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })

          expect(await project.getTags()).toEqual([])
        })

        it('should get one tag', async () => {
          const path = await packageJsonIndependentMonorepoProject({
            2: {
              version: '3.0.0'
            }
          })
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })

          expect(await project.getTags()).toEqual(['subproject-2@3.0.0'])
        })

        it('should get few tags', async () => {
          const path = await packageJsonIndependentMonorepoProject({
            2: {
              version: '3.0.0'
            },
            3: {
              version: '4.0.0'
            }
          })
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })

          expect(await project.getTags()).toEqual(['subproject-2@3.0.0', 'subproject-3@4.0.0'])
        })

        it('should get release data', async () => {
          const path = await packageJsonIndependentMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })
          const release = await project.getReleaseData()

          expect(release).toEqual([
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'subproject-1: v2.0.0',
              isPrerelease: false
            },
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'subproject-2: v2.0.0',
              isPrerelease: false
            },
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'subproject-3: v2.0.0',
              isPrerelease: false
            }
          ])
        })

        it('should not get some release data', async () => {
          const path = await packageJsonIndependentMonorepoProject({
            2: {
              version: '3.0.0'
            }
          })
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })
          const release = await project.getReleaseData()

          expect(release).toEqual([
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'subproject-1: v2.0.0',
              isPrerelease: false
            },
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'subproject-3: v2.0.0',
              isPrerelease: false
            }
          ])
        })

        it('should bump version', async () => {
          const path = await forkProject('bump', packageJsonIndependentMonorepoProject())
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })
          const projects: GenericProject[] = []

          for await (const subProject of project.getProjects()) {
            projects.push(subProject)
          }

          projects[1].manifest.writeVersion('2.1.0')
          projects[2].manifest.writeVersion('3.0.0')

          const result = await project.bump()

          expect(result).toBe(true)
          expect(project.changedFiles).toMatchObject([
            expect.stringMatching(/subproject-1\/package\.json$/),
            expect.stringMatching(/subproject-1\/CHANGELOG\.md$/),
            expect.stringMatching(/subproject-2\/package\.json$/),
            expect.stringMatching(/subproject-2\/CHANGELOG\.md$/),
            expect.stringMatching(/subproject-3\/package\.json$/),
            expect.stringMatching(/subproject-3\/CHANGELOG\.md$/)
          ])
          expect(project.versionUpdates).toMatchObject([
            {
              from: '2.0.0',
              to: '2.1.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[2/)
            },
            {
              from: '2.1.0',
              to: '2.2.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[2/)
            },
            {
              from: '3.0.0',
              to: '3.1.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[3/)
            }
          ])
        })

        it('should get commit message after bump', async () => {
          const path = await packageJsonIndependentMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'independent',
            root: path,
            getProjects
          })

          await project.bump({
            dryRun: true
          })

          const message = project.getCommitMessage()

          expect(message).toBe(`chore(release): monorepo release

- subproject-1@2.1.0
- subproject-2@2.1.0
- subproject-3@2.1.0`)
        })
      })

      describe('fixed mode', () => {
        it('should get no tags', async () => {
          const path = await packageJsonFixedMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })

          expect(await project.getTags()).toEqual([])
        })

        it('should get one tag', async () => {
          const path = await packageJsonFixedMonorepoProject({
            0: {
              version: '3.0.0'
            }
          })
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })

          expect(await project.getTags()).toEqual(['v3.0.0'])
        })

        it('should get release data', async () => {
          const path = await packageJsonFixedMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })
          const release = await project.getReleaseData()

          expect(release).toEqual([
            {
              version: '2.0.0',
              notes: 'RELEASE NOTES',
              previousTag: 'v1.0.0',
              nextTag: 'v2.0.0',
              title: 'v2.0.0',
              isPrerelease: false
            }
          ])
        })

        it('should not get release data', async () => {
          const path = await packageJsonFixedMonorepoProject({
            0: {
              version: '3.0.0'
            }
          })
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })
          const release = await project.getReleaseData()

          expect(release).toEqual([])
        })

        it('should bump version', async () => {
          const path = await forkProject('bump', packageJsonFixedMonorepoProject())
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })
          const result = await project.bump()

          expect(result).toBe(true)
          expect(project.changedFiles).toMatchObject([
            expect.stringMatching(/\/package\.json$/),
            expect.stringMatching(/\/CHANGELOG\.md$/),
            expect.stringMatching(/subproject-2\/package\.json$/),
            expect.stringMatching(/subproject-2\/CHANGELOG\.md$/),
            expect.stringMatching(/subproject-3\/package\.json$/),
            expect.stringMatching(/subproject-3\/CHANGELOG\.md$/)
          ])
          expect(project.versionUpdates).toMatchObject([
            {
              name: 'package-json-monorepo-project',
              from: '2.0.0',
              to: '2.1.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[2/)
            },
            {
              name: 'subproject-2',
              from: '2.0.0',
              to: '2.1.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[2/)
            },
            {
              name: 'subproject-3',
              from: '2.0.0',
              to: '2.1.0',
              files: [expect.stringMatching(/package\.json$/)],
              notes: expect.stringMatching(/^## \[2/)
            }
          ])
        })

        it('should get commit message after bump', async () => {
          const path = await packageJsonFixedMonorepoProject()
          const project = new PackageJsonMonorepoProject({
            mode: 'fixed',
            root: path,
            getProjects
          })

          await project.bump({
            dryRun: true
          })

          const message = project.getCommitMessage()

          expect(message).toBe('chore(release): 2.1.0')
        })
      })
    })
  })
})
