import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { mkdirpSync } from 'mkdirp';
import { assertIn, assertIsDefined } from './helpres';
import { ARCH_MAPPING, PLATFORM_MAPPING } from './mappings';
import { trimStart } from 'lodash';
import findPrefix from 'find-npm-prefix';

export const getInstallationPath = async (): Promise<string> => {
  // We couldn't infer path from `npm bin`. Let's try to get it from
  // Environment variables set by NPM when it runs.
  // npm_config_prefix points to NPM's installation directory where `bin` folder is available
  // Ex: /Users/foo/.nvm/versions/node/v4.3.0
  const env = process.env;

  // Get the package manager who is running the script
  // This is needed since PNPM works in a different way than NPM or YARN.
  let dir: string;
  if (env && env.npm_config_prefix) {
    dir = join(env.npm_config_prefix, 'bin');
  } else if (env && env.npm_config_local_prefix) {
    dir = join(env.npm_config_local_prefix, join('node_modules', '.bin'));
  } else {
    const prefix: string = await findPrefix(process.cwd);
    dir = join(prefix, 'node_modules', '.bin');
  }

  dir = dir.replace(/node_modules.*[\/\\]\.bin/, join('node_modules', '.bin'));

  mkdirpSync(dir);

  return dir;
};

const validateConfiguration = ({ version, goBinary }: any): void => {
  assertIsDefined(version, 'Invalid package.json: \'version\' property must be specified');

  if (!goBinary || typeof (goBinary) !== 'object') {
    throw new Error('\'goBinary\' property must be defined and be an object');
  }

  assertIsDefined(goBinary.name, 'Invalid package.json: \'name\' property is required');
  assertIsDefined(goBinary.path, 'Invalid package.json: \'path\' property is required');
  assertIsDefined(goBinary.url, 'Invalid package.json: \'url\' property is required');
};

export const getUrl = (url: Record<string, string | Record<string, string>> | string): string => {
  if (typeof url === 'string') {
    return url;
  }

  let internalUrl = url[PLATFORM_MAPPING[process.platform]]
    ? url[PLATFORM_MAPPING[process.platform]]
    : url.default;

  if (typeof internalUrl === 'string') {
    return internalUrl;
  }

  if (internalUrl[ARCH_MAPPING[process.arch]]) {
    return internalUrl[ARCH_MAPPING[process.arch]];
  }

  return internalUrl.default;
};

export function parsePackageJson(): Promise<PackageJsonInfo> {
  assertIn(process.arch, ARCH_MAPPING, `Installation is not supported for this architecture: ${ process.arch }`);
  assertIn(process.platform, PLATFORM_MAPPING, `Installation is not supported for this platform: ${ process.platform }`);

  const packageJsonPath = join('.', 'package.json');

  if (!existsSync(packageJsonPath)) {
    console.error('Unable to find package.json. ' +
      'Please run this script at root of the package you want to be installed');
    return;
  }

  const packageJsonContent = readFileSync(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonContent);
  validateConfiguration(packageJson);

  // We have validated the config. It exists in all its glory
  const binPath = packageJson.goBinary.path;
  const binName: string = process.platform === 'win32'
    ? `${ packageJson.goBinary.name }.exe`
    : packageJson.goBinary.name;

  let sourceUrl = getUrl(packageJson.goBinary.url);
  assertIsDefined(sourceUrl, 'Could not find url matching platform and architecture');

  // strip the 'v' if necessary v0.0.1 => 0.0.1
  const version = trimStart(packageJson.version, 'v');
  const archiveExt = process.platform === 'win32' ? '.zip' : '.tar.gz';
  const winExt = process.platform === 'win32' ? '.exe' : '';

  // Interpolate variables in URL, if necessary
  const url = sourceUrl.replace(/{{arch}}/g, ARCH_MAPPING[process.arch])
    .replace(/{{platform}}/g, PLATFORM_MAPPING[process.platform])
    .replace(/{{version}}/g, version)
    .replace(/{{bin_name}}/g, binName)
    .replace(/{{win_ext}}/g, winExt)
    .replace(/{{archive_ext}}/g, archiveExt);

  return Promise.resolve({ binName, binPath, url, version });
}
