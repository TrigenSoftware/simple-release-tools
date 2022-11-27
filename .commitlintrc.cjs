const lernaScopes = require('@commitlint/config-pnpm-scopes')

module.exports = {
  extends: [
    '@commitlint/config-conventional',
    '@commitlint/config-pnpm-scopes'
  ],
  rules: {
    'body-max-line-length': [0],
    'scope-enum': async (ctx) => {
      const scopeEnum = await lernaScopes.rules['scope-enum'](ctx)

      return [
        scopeEnum[0],
        scopeEnum[1],
        [
          ...scopeEnum[2],
          'deps',
          'dev-deps'
        ]
      ]
    }
  },
  prompt: {
    settings: {
      enableMultipleScopes: true
    }
  }
}
