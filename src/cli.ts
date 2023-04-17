import { uninstall } from './actions/uninstall';
import { install } from './actions/install';

const actions = { install, uninstall, };

// Parse command line arguments and call the right action
export default async (argv) => {
  if (!(argv && argv.length > 2)) {
    throw new Error('No command supplied. `install` and `uninstall` are the only supported commands');
  }

  const cmd = argv[2];

  if (!actions[cmd]) {
    throw new Error('Invalid command to go-npm. `install` and `uninstall` are the only supported commands');
  }

  await actions[cmd];
};
