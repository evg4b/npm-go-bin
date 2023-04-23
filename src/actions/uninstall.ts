import { join } from 'path';
import { unlink } from 'fs/promises';
import { getInstallationPath, getPackageInfo } from '../helpres';

export const uninstall: Action = async (platform: Platform, arch: Architecture, prefix: string): Promise<void> => {
  const { binName } = await getPackageInfo(platform, arch, prefix);
  const installationPath = await getInstallationPath(prefix);
  
  await unlink(join(installationPath, binName))
    .catch(e => e.code !== 'ENOENT' ? Promise.reject(e) : Promise.resolve());
};
