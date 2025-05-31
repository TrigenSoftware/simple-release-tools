interface Comment {
  body?: string
  author_association: string
}

const ALLOWED_AUTHOR_ASSOCIATIONS = [
  'OWNER',
  'COLLABORATOR',
  'MEMBER'
]
const JSON_START = '```json'
const JSON_START_OFFSET = JSON_START.length
const JSON_END = '```'

export const SET_OPTION_COMMAND = '!simple-release/set-options'

export function parseSetOptionsComment(comment: Comment): string | null {
  if (ALLOWED_AUTHOR_ASSOCIATIONS.includes(comment.author_association)) {
    const { body } = comment

    if (body?.startsWith(SET_OPTION_COMMAND)) {
      const start = body.indexOf(JSON_START)
      const end = body.lastIndexOf(JSON_END)
      const json = body.substring(start + JSON_START_OFFSET, end).trim()

      return json
    }
  }

  return null
}
