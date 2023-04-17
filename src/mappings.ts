// Mapping from Node's `process.arch` to Golang's `$GOARCH`
export const ARCH_MAPPING = {
  ia32: '386',
  x64: 'amd64',
  arm: 'arm',
  arm64: 'arm64',
};

// Mapping between Node's `process.platform` to Golang's
export const PLATFORM_MAPPING = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
  freebsd: 'freebsd',
};
