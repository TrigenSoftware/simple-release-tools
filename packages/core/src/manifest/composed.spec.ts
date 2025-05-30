import fs from 'fs/promises'
import {
  describe,
  it,
  expect
} from 'vitest'
import {
  copyMockFile,
  getMockFilePath
} from 'test'
import { PackageJsonManifest } from './packageJson.js'
import { ComposedProjectManifest } from './composed.js'

describe('core', () => {
  describe('manifest', () => {
    describe('ComposedProjectManifest', () => {
      it('should read project name from ', async () => {
        const manifest = new ComposedProjectManifest(
          new PackageJsonManifest(
            getMockFilePath('public-package.json')
          ),
          [
            new PackageJsonManifest(
              getMockFilePath('private-package.json')
            )
          ]
        )

        expect(await manifest.getName()).toBe('public-package')
      })

      it('should read project version', async () => {
        const manifest = new ComposedProjectManifest(
          new PackageJsonManifest(
            getMockFilePath('public-package.json')
          ),
          [
            new PackageJsonManifest(
              getMockFilePath('private-package.json')
            )
          ]
        )

        expect(await manifest.getVersion()).toBe('1.0.0')
      })

      it('should read project private', async () => {
        let manifest = new ComposedProjectManifest(
          new PackageJsonManifest(
            getMockFilePath('public-package.json')
          ),
          [
            new PackageJsonManifest(
              getMockFilePath('private-package.json')
            )
          ]
        )

        expect(await manifest.isPrivate()).toBe(false)

        manifest = new ComposedProjectManifest(
          new PackageJsonManifest(
            getMockFilePath('private-package.json')
          ),
          [
            new PackageJsonManifest(
              getMockFilePath('public-package.json')
            )
          ]
        )

        expect(await manifest.isPrivate()).toBe(true)
      })

      it('should write project version', async () => {
        const mainManifestPath = await copyMockFile('public-package.json')
        const subManifestPath = await copyMockFile('private-package.json')
        const manifest = new ComposedProjectManifest(
          new PackageJsonManifest(mainManifestPath),
          [new PackageJsonManifest(subManifestPath)]
        )

        expect(await manifest.getVersion()).toBe('1.0.0')

        expect(await manifest.writeVersion('2.0.0')).toEqual({
          name: 'public-package',
          from: '1.0.0',
          to: '2.0.0',
          files: [mainManifestPath, subManifestPath]
        })

        expect(await manifest.getVersion()).toBe('2.0.0')

        let content = await fs.readFile(mainManifestPath, 'utf-8')

        expect(content).toContain('"version": "2.0.0"')

        content = await fs.readFile(subManifestPath, 'utf-8')

        expect(content).toContain('"version": "2.0.0"')

        expect(await manifest.writeVersion('3.0.0', true)).toEqual({
          name: 'public-package',
          from: '2.0.0',
          to: '3.0.0',
          files: [mainManifestPath, subManifestPath]
        })

        expect(await manifest.getVersion()).toBe('3.0.0')

        content = await fs.readFile(mainManifestPath, 'utf-8')

        expect(content).toContain('"version": "2.0.0"')

        content = await fs.readFile(subManifestPath, 'utf-8')

        expect(content).toContain('"version": "2.0.0"')
      })
    })
  })
})
