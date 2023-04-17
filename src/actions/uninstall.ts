const { join } = require('path');
const { unlinkSync } = require('fs');
const { parsePackageJson, getInstallationPath } = require('../common');

export async function uninstall(callback): Promise<void> {

  const { binName } = await parsePackageJson();

  getInstallationPath((err, installationPath) => {
      if (err) {
          return callback(err);
      }

      try {
          unlinkSync(join(installationPath, binName));
      } catch(ex) {
          // Ignore errors when deleting the file.
      }

      return callback(null);
  });
}
