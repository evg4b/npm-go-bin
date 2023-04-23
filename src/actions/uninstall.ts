import { join } from 'path';

import { unlinkSync } from 'fs';
import { getInstallationPath, getPackageInfo } from '../helpres';

export const uninstall: Action = async (platform: Platform, arch: Architecture, prefix: string): Promise<void> => {
  const { binName } = await getPackageInfo(platform, arch, prefix);
  const installationPath = await getInstallationPath(prefix);
  try {
    unlinkSync(join(installationPath, binName));
  } catch (ex) {
    // Ignore errors when deleting the file.
  }
};
