import { getInstallationPath, getPackageInfo, loadFile, unpackArchive } from '../helpres';
import { mkdir } from 'fs/promises';
import { verifyAndPlaceBinary } from './binary';

export const install: Action = async (platform: Platform, arch: Architecture, prefix: string): Promise<void> => {
  const packageInfo = await getPackageInfo(platform, arch, prefix);
  const installationPath = await getInstallationPath(prefix);

  await mkdir(installationPath, { recursive: true });

  console.log('Downloading from URL: ' + packageInfo.url);

  const fileStream = await loadFile(packageInfo.url);
  await unpackArchive(fileStream, packageInfo, installationPath);
  await verifyAndPlaceBinary(packageInfo.binName, installationPath, prefix);
};
