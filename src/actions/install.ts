import { mkdirpSync } from 'mkdirp';
const request = require('request');
import { parsePackageJson } from '../common';
import { verifyAndPlaceBinary } from '../assets/binary';

/**
 * Select a resource handling strategy based on given options.
 */
function getStrategy({ url }) {
  if (url.endsWith('.tar.gz')) {
      return require('../assets/untar');
  } else if (url.endsWith('.zip')) {
      return require('../assets/unzip');
  } else {
      return require('../assets/move');
  }
}

/**
 * Reads the configuration from application's package.json,
 * validates properties, downloads the binary, untars, and stores at
 * ./bin in the package's root. NPM already has support to install binary files
 * specific locations when invoked with "npm install -g"
 *
 *  See: https://docs.npmjs.com/files/package.json#bin
 */
export async function install(callback): Promise<void> {

  const opts = await parsePackageJson();
  if (!opts) return callback('Invalid inputs');

  mkdirpSync(opts.binPath);

  console.log('Downloading from URL: ' + opts.url);

  const req = request({ uri: opts.url });

  req.on('error', () => callback('Error downloading from URL: ' + opts.url));
  req.on('response', (res) => {
      if (res.statusCode !== 200) return callback('Error downloading binary. HTTP Status Code: ' + res.statusCode);

      const strategy = getStrategy(opts);

      strategy({
          opts,
          req,
          onSuccess: () => verifyAndPlaceBinary(opts.binName, opts.binPath, callback),
          onError: callback
      });
  });
}
