import { mkdirpSync } from 'mkdirp';
import { getInstallationPath, parsePackageJson } from './common';
import { verifyAndPlaceBinary } from './binary';
import { finished } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import fetch from 'node-fetch';
import { createGunzip } from 'zlib';
import tar, { extract as extractTar } from 'tar';
import { Extract as extractZip } from 'unzipper';
import { join } from 'path';
import * as console from 'console';

/**
 * Select a resource handling strategy based on given options.
 */
function getStrategy(stream: NodeJS.ReadableStream, opts: PackageJsonInfo, path: string): NodeJS.WritableStream {
  if (opts.url.endsWith('.tar.gz')) {
    return stream.pipe(createGunzip())
      .pipe(extractTar({ path }));
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

  mkdirpSync(opts.binPath);

  console.log('Downloading from URL: ' + opts.url);

  try {
    const response = await fetch(opts.url)
      .then(res => !res.ok
        ? Promise.reject(new Error(`Error downloading binary. HTTP Status Code: ${ res.status } - ${ res.statusText }`))
        : res,
      );

    const path = await getInstallationPath();

    // await finished(getStrategy(response.body, opts, path));
    await finished(
      response.body
        .pipe(createGunzip())
        .pipe(extractTar({ path: 'uncors' }))
        .pipe(createWriteStream(path + '/uncors'))
    );
    // await verifyAndPlaceBinary(opts.binName, opts.binPath);

  } catch (e) {
    throw new Error(`Error downloading from URL: ${ e }`);
  }
}
