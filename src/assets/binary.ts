const { join } = require('path');
const { chmodSync, copyFileSync, existsSync, unlinkSync } = require('fs');
const { getInstallationPath } = require('../common');

export async function verifyAndPlaceBinary(binName, binPath) {
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
