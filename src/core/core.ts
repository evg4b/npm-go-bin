import { assertIn, assertIsDefined } from '../helpres';
import { ARCH_MAPPING, PLATFORM_MAPPING } from './mappings';
import { actions } from '../actions';
import findPrefix from 'find-npm-prefix';

const commandNameIndex = 2;

export const npmGoBin = async (argv: string[], platform: NodeJS.Platform, arch: NodeJS.Architecture, cwd: string) => {
  assertIn(arch, ARCH_MAPPING, `Installation is not supported for this architecture: ${ arch }`);
  assertIn(platform, PLATFORM_MAPPING, `Installation is not supported for this platform: ${ platform }`);

  if (!(argv && argv.length > 2)) {
    throw new Error('No command supplied. `install` and `uninstall` are the only supported commands');
  }

  const action = actions[argv[commandNameIndex]];
  assertIsDefined(action, 'Invalid command to npm-go-bin. `install` and `uninstall` are the only supported commands');

  const prefix = await findPrefix(cwd);

  await action(PLATFORM_MAPPING[platform], ARCH_MAPPING[arch], prefix);
};
