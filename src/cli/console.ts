import colors from 'picocolors'

export function warn(message: string) {
  console.warn(colors.yellow(`🟡 ${message}`))
}

export function link(message: string) {
  console.log(`\n🔗 ${message}\n`)
}

