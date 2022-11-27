import colors from 'picocolors'

export function warn(message: string) {
  console.warn(colors.yellow(`🟡 ${message}`))
}

export function link(message: string) {
  console.log(`\n🔗 ${message}\n`)
}

export function error(message: string | Error) {
  console.error(colors.red(`🔴 ${message instanceof Error ? message.message : message}`))
}
