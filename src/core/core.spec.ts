jest.mock('../actions/install');
jest.mock('../actions/uninstall');

import { npmGoBin } from './core';

describe('core', () => {
  describe('for unsupported platform', () => {
    ['aix', 'android', 'haiku', 'openbsd', 'sunos', 'cygwin', 'netbsd']
      .forEach((platform: NodeJS.Platform) => {
        it(`should throw error for ${ platform } platform`, async () => {
          await npmGoBin([], platform, 'arm64', '/usr/bin');
        });
      });
  });
});
