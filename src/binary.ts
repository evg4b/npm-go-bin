import { join } from 'path';
import { chmodSync, copyFileSync, existsSync, unlinkSync } from 'fs';
import { getInstallationPath } from './common';

export async function verifyAndPlaceBinary(binName: string, binPath: string) {
  if (!existsSync(join(binPath, binName))) {
    throw new Error(`Downloaded binary does not contain the binary specified in configuration - ${ binName }`);
  }

  const installationPath = await getInstallationPath();

  // Move the binary file and make sure it is executable
  copyFileSync(join(binPath, binName), join(installationPath, binName));
  unlinkSync(join(binPath, binName));
  chmodSync(join(installationPath, binName), '755');

  console.log('Placed binary on', join(installationPath, binName));
}