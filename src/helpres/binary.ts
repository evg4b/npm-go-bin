import { join } from 'path';
import { chmod } from 'fs/promises';
import { checkFileExists } from './helpres';

export const verifyAndPlaceBinary = async (binName: string, installationPath: string) => {
  if (!await checkFileExists(join(installationPath, binName))) {
    throw new Error(`Downloaded binary does not contain the binary specified in configuration - ${ binName }`);
  }

  await chmod(join(installationPath, binName), 755);

  console.log('Placed binary on', join(installationPath, binName));
};
