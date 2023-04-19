import { join } from 'path';

const { unlinkSync } = require('fs');
const { getPackageInfo, getInstallationPath } = require('../helpres/helpres');

export  const uninstall: Action = async (platform: Platform, arch: Architecture, cwd: string): Promise<void> => {
  const { binName } = await getPackageInfo(platform, arch, cwd);
  const installationPath = await getInstallationPath();
  try {
    unlinkSync(join(installationPath, binName));
  } catch (ex) {
    // Ignore errors when deleting the file.
  }
}
