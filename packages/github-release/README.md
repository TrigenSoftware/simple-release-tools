# @simple-release/github-release

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@simple-release/github-release.svg
[npm-url]: https://www.npmjs.com/package/@simple-release/github-release

[node]: https://img.shields.io/node/v/@simple-release/github-release.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/librariesio/release/npm/@simple-release/github-release
[deps-url]: https://libraries.io/npm/@simple-release%2Fcore/tree

[size]: https://packagephobia.com/badge?p=@simple-release/github-release
[size-url]: https://packagephobia.com/result?p=@simple-release/github-release

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/simple-release/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/simple-release/actions

[coverage]: https://coveralls.io/repos/github/TrigenSoftware/simple-release/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/TrigenSoftware/simple-release?branch=main

A github release addon for simple-release.

## Install

```bash
# pnpm
pnpm add @simple-release/github-release
# yarn
yarn add @simple-release/github-release
# npm
npm i @simple-release/github-release
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
  .publish()
  .release(new GithubReleaseCreator({
    token: process.env.GITHUB_TOKEN
  }))
  .run()
```

## Options

### `token`

The GitHub personal access token to authenticate with the GitHub API.

### `owner`

The GitHub owner (username or organization) of the repository. If not provided, it will be inferred from the remote URL.

### `project`

The GitHub project (repository name) to create releases in. If not provided, it will be inferred from the remote URL.
