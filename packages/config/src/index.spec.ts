import { join } from 'path'
import {
  vi,
  describe,
  it,
  expect
} from 'vitest'
import { PackageJsonProject } from '@simple-release/core'
import {
  parseImportQuery,
  loadClass
} from './index.js'

describe('config', () => {
  describe('parseImportQuery', () => {
    it('should parse a simple import query', () => {
      expect(
        parseImportQuery('path/to/module')
      ).toEqual({
        path: 'path/to/module'
      })
    })

    it('should parse an import query with version', () => {
      expect(
        parseImportQuery('path/to/module@1.0.0')
      ).toEqual({
        path: 'path/to/module',
        version: '1.0.0'
      })
    })

    it('should parse an import query with symbol', () => {
      expect(
        parseImportQuery('path/to/module#MyClass')
      ).toEqual({
        path: 'path/to/module',
        symbol: 'MyClass'
      })
    })

    it('should parse an import query with version and symbol', () => {
      expect(
        parseImportQuery('path/to/module@1.0.0#MyClass')
      ).toEqual({
        path: 'path/to/module',
        version: '1.0.0',
        symbol: 'MyClass'
      })
    })

    it('should parse an import query with scoped package', () => {
      expect(
        parseImportQuery('@simple-release/core#PackageJsonProject')
      ).toEqual({
        path: '@simple-release/core',
        symbol: 'PackageJsonProject'
      })
    })
  })

  describe('loadClass', () => {
    it('should load a class from a module', async () => {
      const project = await loadClass(
        [
          '@simple-release/core#PackageJsonProject',
          {
            path: join(__dirname, '..', 'package.json')
          }
        ],
        {}
      )

      expect(project).toBeInstanceOf(PackageJsonProject)
    })

    it('should use custom loader', async () => {
      const loader = vi.fn(() => Promise.resolve({
        PackageJsonProject
      }))
      const project = await loadClass(
        [
          '@simple-release/core@1.0.0#PackageJsonProject',
          {
            path: join(__dirname, '..', 'package.json')
          }
        ],
        {
          config: 'yes'
        } as any,
        loader
      )

      expect(project).toBeInstanceOf(PackageJsonProject)
      expect(loader).toHaveBeenCalledWith('@simple-release/core', '1.0.0', {
        config: 'yes'
      })
    })
  })
})
