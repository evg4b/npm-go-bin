import { join } from 'path';
const { unlinkSync } = require('fs');
const { parsePackageJson, getInstallationPath } = require('./common');

export async function uninstall(): Promise<void> {

  const { binName } = await parsePackageJson();
  const installationPath = await getInstallationPath();
  try {
    unlinkSync(join(installationPath, binName));
  } catch(ex) {
    // Ignore errors when deleting the file.
  }

}
