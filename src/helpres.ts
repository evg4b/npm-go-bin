import { join } from 'path';
import findPrefix from 'find-npm-prefix';
import { ARCH_MAPPING, PLATFORM_MAPPING } from './mappings';
import { access, mkdir, readFile } from 'fs/promises';
import trimStart from 'lodash/trimStart';
import { constants } from 'fs';

export const assertIn = <T = any>(value: string, definition: Record<string, T>, message?: string) => {
  if (!(value in definition)) {
    throw new Error(message ?? `Value ${ JSON.stringify(value) } is not allowed.`);
  }
};

export const assertIsDefined = <T = any>(value: T, message?: string) => {
  if (value === null || typeof value === 'undefined') {
    throw new Error(message ?? 'Value should be defined');
  }
};

export const getInstallationPath = async (): Promise<string> => {
  // We couldn't infer path from `npm bin`. Let's try to get it from
  // Environment variables set by NPM when it runs.
  // npm_config_prefix points to NPM's installation directory where `bin` folder is available
  // Ex: /Users/foo/.nvm/versions/node/v4.3.0
  const { npm_config_prefix, npm_config_local_prefix } = process.env ?? {};

  // Get the package manager who is running the script
  // This is needed since PNPM works in a different way than NPM or YARN.
  let dir: string;
  if (npm_config_prefix) {
    dir = join(npm_config_prefix, '.bin');
  } else if (npm_config_local_prefix) {
    dir = join(npm_config_local_prefix, join('node_modules', '.bin'));
  } else {
    const prefix: string = await findPrefix(process.cwd());
    dir = join(prefix, 'node_modules', '.bin');
  }

  dir = dir.replace(/node_modules.*[\/\\]\.bin/, join('node_modules', '.bin'));

  await mkdir(dir, { recursive: true });

  return dir;
};

const validateConfiguration = (config: any): void => {
  assertIsDefined(config.version, 'Invalid package.json: \'version\' property must be specified');

  const binConfig = config['go-bin'];
  assertIsDefined(config.version, 'Invalid package.json: \'go-bin\' property must be defined');
  if (typeof (binConfig) !== 'object') {
    throw new Error('\'go-bin\' property must be an object');
  }

  assertIsDefined(binConfig.name, 'Invalid package.json: \'name\' property is required');
  assertIsDefined(binConfig.path, 'Invalid package.json: \'path\' property is required');
  assertIsDefined(binConfig.url, 'Invalid package.json: \'url\' property is required');
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

export async function parsePackageJson(): Promise<PackageJsonInfo> {
  assertIn(process.arch, ARCH_MAPPING, `Installation is not supported for this architecture: ${ process.arch }`);
  assertIn(process.platform, PLATFORM_MAPPING, `Installation is not supported for this platform: ${ process.platform }`);

  const prefix = await findPrefix(process.cwd());
  const packageJsonPath = join(prefix, 'package.json');

  const isExists = await checkFileExists(packageJsonPath);
  if (!isExists) {
    throw new Error('Unable to find package.json. ' +
      'Please run this script at root of the package you want to be installed');
  }

  const packageJsonContent = await readFile(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonContent);
  validateConfiguration(packageJson);

  const binConfig = packageJson['go-bin'];
  // We have validated the config. It exists in all its glory
  const binPath = join(prefix, binConfig.path);
  const binName: string = process.platform === 'win32'
    ? `${ binConfig.name }.exe`
    : binConfig.name;

  let sourceUrl = getUrl(binConfig.url);
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

  return { binName, binPath, url, version };
}

function checkFileExists(file: string): Promise<boolean> {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
