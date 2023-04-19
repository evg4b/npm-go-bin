interface PackageJson {
  'go-bin': PackageJsonInfo,
  version: string,
  [key: string]: any
}

interface PackageJsonInfo {
  name: string,
  url: UrlMapping,
  version?: string,
}

interface PackageInfo {
  binName: string,
  url: string,
  version: string,
}

type UrlMapping = Record<string, string | Record<string, string>> | string;

declare module 'find-npm-prefix' {
  const findNpmPrefix: (path: string) => Promise<string>;
  export default findNpmPrefix;
}

type Platform = 'darwin' | 'linux' | 'windows' | 'freebsd';
type Architecture = '386' | 'amd64' | 'arm' | 'arm64';
type Action = (platform: Platform, arch: Architecture, cwd: string) => Promise<void>;
