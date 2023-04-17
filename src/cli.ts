import { uninstall } from './uninstall';
import { install } from './install';
import { assertIsDefined } from './helpres';

const actions = { install, uninstall, };

// Parse command line arguments and call the right action
export default async (argv) => {
  if (!(argv && argv.length > 2)) {
    throw new Error('No command supplied. `install` and `uninstall` are the only supported commands');
  }

  const cmd = argv[2];
  const action = actions[cmd];
  assertIsDefined(action, 'Invalid command to npm-go-bin. `install` and `uninstall` are the only supported commands')

  await action();
};
