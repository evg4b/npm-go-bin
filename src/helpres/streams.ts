import { createGunzip } from 'zlib';
import { extract as extractTar } from 'tar';
import { ParseOne as extractZip } from 'unzipper';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const processZip = (stream: Readable, binName: string, path: string): WritableStream =>
  stream.pipe(extractZip(new RegExp(binName), { forceStream: true }))
    .pipe(createWriteStream(join(path, binName)));

const processTarGz = (stream: Readable, binName: string, path: string): WritableStream =>
  stream.pipe(createGunzip())
    .pipe(extractTar({ cwd: path }, [binName]));

const processBin = (stream: Readable, binName: string, path: string): WritableStream =>
  stream.pipe(createWriteStream(join(path, binName)));

export const unpackArchive = (stream: Readable, { url, binName }: PackageInfo, path: string): Promise<void> => {
  const { pathname } = new URL(url);

  if (pathname.endsWith('.tar.gz')) {
    return finished(processTarGz(stream, binName, path));
  }

  if (pathname.endsWith('.zip')) {
    return finished(processZip(stream, binName, path));
  }

  return finished(processBin(stream, binName, path));
};
