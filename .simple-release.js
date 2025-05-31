import { PnpmWorkspacesProject } from './packages/pnpm/src/index.js'
// import { GithubHosting } from './packages/github/src/index.js'

export const project = new PnpmWorkspacesProject({
  mode: 'fixed'
})

// export const hosting = new GithubHosting({
//   token: process.env.GITHUB_TOKEN
// })

export const releaser = {
  verbose: true
}

// export const bump = {
//   byProject: {
//     'simple-github-release': {
//       firstRelease: false
//     }
//   }
// }
