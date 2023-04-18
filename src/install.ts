import { getInstallationPath, parsePackageJson } from './helpres';
import { finished } from 'stream/promises';
import { createWriteStream } from 'fs';
import fetch from 'node-fetch';
import { createGunzip } from 'zlib';
import { extract as extractTar } from 'tar';
import { Extract as extractZip } from 'unzipper';
import { join } from 'path';
import { verifyAndPlaceBinary } from './binary';
import { mkdir } from 'fs/promises';

/**
 * Select a resource handling strategy based on given options.
 */
function getStrategy(stream: NodeJS.ReadableStream, opts: PackageJsonInfo, path: string): NodeJS.WritableStream {
  if (opts.url.endsWith('.tar.gz')) {
    return stream.pipe(createGunzip())
      .pipe(extractTar({ cwd: path }, [opts.binName]));
  }

  if (opts.url.endsWith('.zip')) {
    return stream.pipe(extractZip({ path }));
  }

  return stream.pipe(createWriteStream(join(path, opts.binName)));
}

/**
 * Reads the configuration from application's package.json,
 * validates properties, downloads the binary, untars, and stores at
 * ./bin in the package's root. NPM already has support to install binary files
 * specific locations when invoked with "npm install -g"
 *
 *  See: https://docs.npmjs.com/files/package.json#bin
 */
export async function install(): Promise<void> {
  const opts = await parsePackageJson();

  await mkdir(opts.binPath, { recursive: true });

  console.log('Downloading from URL: ' + opts.url);

  const path = await getInstallationPath();

  const response = await fetch(opts.url)
    .then(res => !res.ok
      ? Promise.reject(new Error(`Error downloading binary. HTTP Status Code: ${ res.status } - ${ res.statusText }`))
      : res,
    );

  await finished(getStrategy(response.body, opts, path));
  await verifyAndPlaceBinary(opts.binName, path);
}
