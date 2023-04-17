interface PackageJsonInfo {
  binName: string,
  binPath: string,
  url: string,
  version: string,
}

declare module 'find-npm-prefix' {
  const findNpmPrefix: (path: string) => Promise<string>;
  export default findNpmPrefix;
}
