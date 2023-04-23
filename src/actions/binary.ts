import { join } from 'path';
import { chmod } from 'fs/promises';
import { existsSync } from 'fs';
import { getInstallationPath } from '../helpres';

export const verifyAndPlaceBinary = async (binName: string, binPath: string, prefix: string) => {
  if (!existsSync(join(binPath, binName))) {
    throw new Error(`Downloaded binary does not contain the binary specified in configuration - ${ binName }`);
  }

  const installationPath = await getInstallationPath(prefix);

  await chmod(join(installationPath, binName), 755);

  console.log('Placed binary on', join(installationPath, binName));
};
