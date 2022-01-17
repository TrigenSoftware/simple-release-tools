/* eslint-disable import/no-default-export */
import { rm, sh } from '@trigen/scripts'
import { jest } from '@trigen/scripts-plugin-jest'
import { eslint } from '@trigen/scripts-plugin-eslint'
import { emitDeclarations } from '@trigen/scripts-plugin-typescript'

export default {
  lint: {
    title: 'Lint',
    run: eslint({
      files: ['src/**/*.{js,jsx,ts,tsx}', 'scripts.js']
    })
  },
  jest: {
    title: 'Jest',
    run: jest()
  },
  test: {
    title: 'Test',
    run: ['lint', 'jest'],
    parallel: true
  },
  build: {
    title: 'Build',
    run: [emitDeclarations(), sh('rollup', '-c')]
  },
  clean: {
    title: 'Clean',
    run: rm([
      './dist',
      './coverage',
      './node_modules/.cache'
    ])
  }
}
