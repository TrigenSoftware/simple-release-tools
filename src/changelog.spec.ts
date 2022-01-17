import fs from 'fs'
import path from 'path'
import { readLastChangesFromStream } from './changelog'

describe('changelog', () => {
  describe('readLastChangesFromStream', () => {
    it('should read last changes from file', async () => {
      const stream = fs.createReadStream(path.join('test', 'mocks', 'CHANGELOG.md'))

      expect(await readLastChangesFromStream(stream)).toMatchInlineSnapshot(`
Array [
  "8.0.0-alpha.2",
  "### Bug Fixes

* **deps:** update dependency dotenv to v11 ([#16](https://github.com/TrigenSoftware/scripts/issues/16)) ([27e4ce7](https://github.com/TrigenSoftware/scripts/commit/27e4ce7414f6d50fec9fe363238d771cf49b4cd7))
* **deps:** update dependency eslint to v8 ([#17](https://github.com/TrigenSoftware/scripts/issues/17)) ([9dac68c](https://github.com/TrigenSoftware/scripts/commit/9dac68c423a53a53f6ccbd5c19905cdb851b6ea5))
* **deps:** update dependency eslint-plugin-jest-dom to v4 ([#15](https://github.com/TrigenSoftware/scripts/issues/15)) ([8133db1](https://github.com/TrigenSoftware/scripts/commit/8133db151811134b8fc2a22df5efd63bb8d51387))
* **deps:** update typescript-eslint monorepo to v5 ([#18](https://github.com/TrigenSoftware/scripts/issues/18)) ([87f8d42](https://github.com/TrigenSoftware/scripts/commit/87f8d42f749665b8df0daa1c1631b9ac9ca57048))


### Features

* **browserslist-config:** update queries, add esm queries ([3031c6b](https://github.com/TrigenSoftware/scripts/commit/3031c6b322330be57654bdebc1012bddc20e7972))
",
]
`)
    })

    it('should read last changes from file with header', async () => {
      const stream = fs.createReadStream(path.join('test', 'mocks', 'CHANGELOG.md'))
      const options = {
        includeTitle: true
      }

      expect(await readLastChangesFromStream(stream, options)).toMatchInlineSnapshot(`
Array [
  "8.0.0-alpha.2",
  "# [8.0.0-alpha.2](https://github.com/TrigenSoftware/scripts/compare/v8.0.0-alpha.1...v8.0.0-alpha.2) (2022-01-14)


### Bug Fixes

* **deps:** update dependency dotenv to v11 ([#16](https://github.com/TrigenSoftware/scripts/issues/16)) ([27e4ce7](https://github.com/TrigenSoftware/scripts/commit/27e4ce7414f6d50fec9fe363238d771cf49b4cd7))
* **deps:** update dependency eslint to v8 ([#17](https://github.com/TrigenSoftware/scripts/issues/17)) ([9dac68c](https://github.com/TrigenSoftware/scripts/commit/9dac68c423a53a53f6ccbd5c19905cdb851b6ea5))
* **deps:** update dependency eslint-plugin-jest-dom to v4 ([#15](https://github.com/TrigenSoftware/scripts/issues/15)) ([8133db1](https://github.com/TrigenSoftware/scripts/commit/8133db151811134b8fc2a22df5efd63bb8d51387))
* **deps:** update typescript-eslint monorepo to v5 ([#18](https://github.com/TrigenSoftware/scripts/issues/18)) ([87f8d42](https://github.com/TrigenSoftware/scripts/commit/87f8d42f749665b8df0daa1c1631b9ac9ca57048))


### Features

* **browserslist-config:** update queries, add esm queries ([3031c6b](https://github.com/TrigenSoftware/scripts/commit/3031c6b322330be57654bdebc1012bddc20e7972))
",
]
`)
    })
  })
})
