# @simple-release/core

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@simple-release/core.svg
[npm-url]: https://www.npmjs.com/package/@simple-release/core

[node]: https://img.shields.io/node/v/@simple-release/core.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/librariesio/release/npm/@simple-release/core
[deps-url]: https://libraries.io/npm/@simple-release%2Fcore/tree

[size]: https://packagephobia.com/badge?p=@simple-release/core
[size-url]: https://packagephobia.com/result?p=@simple-release/core

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/simple-release/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/simple-release/actions

[coverage]: https://coveralls.io/repos/github/TrigenSoftware/simple-release/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/TrigenSoftware/simple-release?branch=main

A simple tool to release projects with monorepo support.

<hr />
<a href="#install">Install</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#usage">Usage</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#why">Why</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#addons">Addons</a>
<span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
<a href="#custom-addons">Custom addons</a>
<br />
<hr />

## Install

```bash
# pnpm
pnpm add @simple-release/core
# yarn
yarn add @simple-release/core
# npm
npm i @simple-release/core
```

## Usage

```js
import { Releaser } from '@simple-release/core'
import { PnpmProject } from '@simple-release/pnpm'
import { GithubReleaseCreator } from '@simple-release/github-release'

const project = new PnpmProject()

await new Releaser(project)
  .bump()
  .commit()
  .tag()
  .push()
  .release(new GithubReleaseCreator({
    token: process.env.GITHUB_TOKEN
  }))
  .publish()
  .run()
```

Monorepo example:

```js
import { Releaser } from '@simple-release/core'
import { PnpmWorkspacesProject } from '@simple-release/pnpm'
import { GithubReleaseCreator } from '@simple-release/github-release'

const project = new PnpmWorkspacesProject({
  mode: 'independent'
})

await new Releaser(project)
  .bump()
  .commit()
  .tag()
  .push()
  .release(new GithubReleaseCreator({
    token: process.env.GITHUB_TOKEN
  }))
  .publish()
  .run()
```

## Why

There no good tool to release projects with conventional-changelog support and with good monorepo support.

## Addons

- [npm](https://github.com/TrigenSoftware/simple-release/tree/main/packages/npm)
- [pnpm](https://github.com/TrigenSoftware/simple-release/tree/main/packages/pnpm)
- [github-release](https://github.com/TrigenSoftware/simple-release/tree/main/packages/github-release)

## Custom addons

### Manifest

If you want to create your own project addon, firstly you can need to create a custom manifest adapter. Manifest adapter is a class that reads basic information about the project from the manifest file (like `package.json`) and can write version to it.

```js
import { ProjectManifest } from '@simple-release/core'

export class CustomManifest extends ProjectManifest {
  static Filename = 'custom.json'

  async readManifest() {
    // Read the manifest file and return its parsed content
  }

  async getName() {
    // Return the name of the project
  }

  async getVersion() {
    // Return the current version of the project
  }

  async isPrivate() {
    // Return true if the project is private
  }

  async writeVersion(version, dryRun) {
    // Write the new version to the manifest file
    // If dryRun is true, do not write the file, just change the version in memory
  }
}
```

For more detailed example you can look at the [PackageJsonManifest](./src/manifest/packageJson.ts) implementation.

### Project

Project is a class that represents the project and provides methods to work with it:

- bump version
- get information from git
- publish the project
- etc.

Most of the methods are implemented in base class [GenericProject](./src/project/project.ts) and you can extend it to create your own project class.

In most casses you need just prepare options for the base class and implement `publish` method (like it is done in [PackageJsonProject](./src/project/packageJson.ts)).

```js
import { GenericProject } from '@simple-release/core'

export class CustomProject extends GenericProject {
  constructor(options) {
    super({
      ...options,
      manifest: new CustomManifest(options.path)
    })
  }

  async publish(options) {
    // Publish the project
  }
}
```

There also is a base class for monorepo projects - [GenericMonorepoProject](./src/project/monorepo.ts). It provides methods to work with monorepo projects and you can extend it to create your own monorepo project class (alos see [PackageJsonMonorepoProject](./src/project/packageJsonMonorepo.ts)).

### Release creator

Release creator is a class that creates a release in the remote repository (like GitHub, GitLab, etc.) or wherever you want. It is used in the `release` step of the releaser.

Signature of the class is very simple, you just need to implement `create` method:

```js
import { GenericReleaseCreator } from '@simple-release/core'

export class CustomReleaseCreator extends GenericReleaseCreator {
  async create({ project, dryRun, logger }) {
    // Create the release in the remote repository
    // You can use `project` to get information about the project
    // or more precisely you can use `project.getgetReleaseData()` to get the data for the release
  }
}
```
