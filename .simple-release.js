import { PnpmWorkspacesProject } from './packages/pnpm/src/index.js'

export const project = new PnpmWorkspacesProject({
  mode: 'fixed'
})

export const releaser = {
  verbose: true
}

export const publish = {
  access: 'public'
}
