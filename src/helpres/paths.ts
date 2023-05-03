import { join } from 'path';
import { mkdir } from 'fs/promises';

const resolveNodeBinPath = (prefix: string) => {
  const { npm_config_prefix, npm_config_local_prefix } = process.env ?? {};
  if (npm_config_prefix) {
    return join(npm_config_prefix, '.bin');
  }

  if (npm_config_local_prefix) {
    return join(npm_config_local_prefix, join('node_modules', '.bin'));
  }

  return join(prefix, 'node_modules', '.bin');
};

export const getInstallationPath = async (prefix: string): Promise<string> => {
  const dir = resolveNodeBinPath(prefix);
  const normalised = dir.replace(/node_modules.*[/\\]\.bin/, join('node_modules', '.bin'));
  await mkdir(normalised, { recursive: true });

  return normalised;
};
