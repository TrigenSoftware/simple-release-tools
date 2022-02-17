export const octokit = {
  shouldThrowError: false,
  repos: {
    listReleases() {
      if (octokit.shouldThrowError) {
        octokit.shouldThrowError = false
        throw new Error()
      }

      return {
        data: [
          {
            id: 1,
            tag_name: 'v1.0.0'
          }
        ]
      }
    },
    createRelease() {
      return {
        data: {
          id: 1,
          html_url: 'https://github.com/release'
        }
      }
    },
    updateRelease() {
      return {
        data: {
          id: 1,
          html_url: 'https://github.com/release'
        }
      }
    }
  }
}
