import { getInstallationPath, getPackageInfo, loadFile } from '../helpres';
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { extract as extractTar } from 'tar';
import { Extract as extractZip } from 'unzipper';
import { join } from 'path';
import { verifyAndPlaceBinary } from './binary';
import { mkdir } from 'fs/promises';

/**
 * Select a resource handling strategy based on given options.
 */
function loadStream(stream: NodeJS.ReadableStream, opts: PackageInfo, path: string): NodeJS.WritableStream {
  if (opts.url.endsWith('.tar.gz')) {
    return stream.pipe(createGunzip())
      .pipe(extractTar({ cwd: path }, [opts.binName]));
  }

  if (opts.url.endsWith('.zip')) {
    return stream.pipe(extractZip({ path }));
  }

  return stream.pipe(createWriteStream(join(path, opts.binName)));
}

export const install: Action = async (platform: Platform, arch: Architecture, prefix: string): Promise<void> => {
  const packageInfo = await getPackageInfo(platform, arch, prefix);
  const path = await getInstallationPath(prefix);

  await mkdir(path, { recursive: true });

  console.log('Downloading from URL: ' + packageInfo.url);

  const fileStream = await loadFile(packageInfo.url);
  await finished(loadStream(fileStream, packageInfo, path));
  await verifyAndPlaceBinary(packageInfo.binName, path, prefix);
};
