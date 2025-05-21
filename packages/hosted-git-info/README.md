# @simple-release/hosted-git-info

[![ESM-only package][package]][package-url]
[![NPM version][npm]][npm-url]
[![Node version][node]][node-url]
[![Dependencies status][deps]][deps-url]
[![Install size][size]][size-url]
[![Build status][build]][build-url]
[![Coverage status][coverage]][coverage-url]

[package]: https://img.shields.io/badge/package-ESM--only-ffe536.svg
[package-url]: https://nodejs.org/api/esm.html

[npm]: https://img.shields.io/npm/v/@simple-release/hosted-git-info.svg
[npm-url]: https://www.npmjs.com/package/@simple-release/hosted-git-info

[node]: https://img.shields.io/node/v/@simple-release/hosted-git-info.svg
[node-url]: https://nodejs.org

[deps]: https://img.shields.io/librariesio/release/npm/@simple-release/hosted-git-info
[deps-url]: https://libraries.io/npm/@simple-release%2Fhosted-git-info/tree

[size]: https://packagephobia.com/badge?p=@simple-release/hosted-git-info
[size-url]: https://packagephobia.com/result?p=@simple-release/hosted-git-info

[build]: https://img.shields.io/github/actions/workflow/status/TrigenSoftware/simple-release-tools/tests.yml?branch=main
[build-url]: https://github.com/TrigenSoftware/simple-release-tools/actions

[coverage]: https://img.shields.io/codecov/c/github/TrigenSoftware/simple-release-tools.svg?flag=@simple-release/hosted-git-info
[coverage-url]: https://app.codecov.io/gh/TrigenSoftware/simple-release-tools/tree/main/packages%2Fhosted-git-info

A small library to parse hosted git info.

## Install

```bash
# pnpm
pnpm add @simple-release/hosted-git-info
# yarn
yarn add @simple-release/hosted-git-info
# npm
npm i @simple-release/hosted-git-info
```

## Usage

```ts
import { parseHostedGitUrl } from '@simple-release/hosted-git-info'

parseHostedGitUrl('github:foo/bar')
/* {
  type: 'github',
  url: 'https://github.com/foo/bar',
  host: 'https://github.com',
  owner: 'foo',
  project: 'bar'
} */
parseHostedGitUrl('git+ssh://bitbucket.org:foo/bar.git')
/* {
  type: 'bitbucket',
  url: 'https://bitbucket.org/foo/bar',
  host: 'https://bitbucket.org',
  owner: 'foo',
  project: 'bar'
} */
parseHostedGitUrl('https://user@gitlab.com/foo/bar.git#branch')
/* {
  type: 'gitlab',
  url: 'https://gitlab.com/foo/bar/tree/branch',
  host: 'https://gitlab.com',
  owner: 'foo',
  project: 'bar'
} */
```
