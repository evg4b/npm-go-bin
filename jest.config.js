module.exports = {
  verbose: true,
  preset: 'ts-jest',
  displayName: 'npm-go-bin',
  transform: {
    '^.+\\.ts?$': ['esbuild-jest', { sourcemap: true }]
  }
};
