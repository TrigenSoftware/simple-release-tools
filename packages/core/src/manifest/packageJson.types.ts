export interface PackageJsonKnownProps {
  name: string
  version: string
  private?: boolean
}

export type PackageJsonProps = PackageJsonKnownProps & Record<string, unknown>
