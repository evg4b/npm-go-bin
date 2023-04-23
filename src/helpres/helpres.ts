import { join } from 'path';
import { access, readFile } from 'fs/promises';
import trimStart from 'lodash/trimStart';
import { constants } from 'fs';
import { assertIsDefined } from './asserts';

const validateConfiguration = (config: any): void => {
  assertIsDefined(config.version, 'Invalid package.json: \'version\' property must be specified');

  const binConfig = config['go-bin'];
  assertIsDefined(config.version, 'Invalid package.json: \'go-bin\' property must be defined');
  if (typeof (binConfig) !== 'object') {
    throw new Error('\'go-bin\' property must be an object');
  }

  assertIsDefined(binConfig.name, 'Invalid package.json: \'name\' property is required');
  assertIsDefined(binConfig.url, 'Invalid package.json: \'url\' property is required');
};

export const resolveUrl = (url: UrlMapping, platform: Platform, arch: Architecture): string => {
  if (typeof url === 'string') {
    return url;
  }

  const internalUrl = url[platform] ?? url.default;
  if (typeof internalUrl === 'string') {
    return internalUrl;
  }

  return internalUrl[arch] ?? internalUrl.default;
};

export async function getPackageInfo(platform: Platform, arch: Architecture, prefix: string): Promise<PackageInfo> {
  const packageJsonPath = join(prefix, 'package.json');

  if (!await checkFileExists(packageJsonPath)) {
    throw new Error('Unable to find package.json. ' +
      'Please run this script at root of the package you want to be installed');
  }

  const packageJsonContent = await readFile(packageJsonPath, { encoding: 'utf-8' });
  const packageJson = JSON.parse(packageJsonContent) as PackageJson;
  validateConfiguration(packageJson);

  const binConfig = packageJson['go-bin'];
  // We have validated the config. It exists in all its glory
  const binName: string = platform === 'windows'
    ? `${ binConfig.name }.exe`
    : binConfig.name;

  const sourceUrl = resolveUrl(binConfig.url, platform, arch);
  assertIsDefined(sourceUrl, 'Could not find url matching platform and architecture');

  const version = trimStart(binConfig.version ?? packageJson.version, 'v');
  const archiveExt = platform === 'windows' ? '.zip' : '.tar.gz';
  const winExt = platform === 'windows' ? '.exe' : '';

  // Interpolate variables in URL, if necessary
  const url = sourceUrl.replace(/{{arch}}/g, arch)
    .replace(/{{platform}}/g, platform)
    .replace(/{{version}}/g, version)
    .replace(/{{bin_name}}/g, binName)
    .replace(/{{win_ext}}/g, winExt)
    .replace(/{{archive_ext}}/g, archiveExt);

  return { binName, url, version };
}

function checkFileExists(file: string): Promise<boolean> {
  return access(file, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}
