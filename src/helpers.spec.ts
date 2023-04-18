import * as fs from 'fs';
import { getInstallationPath, getUrl, parsePackageJson } from './helpres';
import { join, sep } from 'path';

jest.mock('fs');
jest.mock('mkdirp');

describe('common', () => {
  describe('getInstallationPath()', () => {
    let env;

    beforeEach(() => env = { ...process.env });

    afterEach(() => process.env = env);

    it('should get binaries path from `npm bin`', async () => {
      const path = await getInstallationPath();

      expect(path).toEqual(sep + join('usr', 'local', 'bin'));
    });

    it('should get binaries path from env', async () => {
      process.env.npm_config_prefix = '/usr/local';

      const path = await getInstallationPath();

      expect(path).toEqual(sep + join('usr', 'local', 'bin'));
    });

    it('should call callback with error if binaries path is not found', () => {
      expect(async () => {
        process.env.npm_config_prefix = undefined;

        await getInstallationPath();
      })
        .toThrowError('Error finding binary installation directory');
    });
  });

  describe('getUrl', () => {
    it('should get url from given string url', () => {
      const url = getUrl('http://url');

      expect(url).toEqual('http://url');
    });

    it('should get specific url for current platform', () => {
      const url = getUrl({
        default: 'http://url.tar.gz',
        windows: 'http://url.exe.zip',
      });
      // , { platform: 'win32' }

      expect(url).toEqual('http://url.exe.zip');
    });

    it('should get default url for current platform', () => {
      const url = getUrl({
        default: 'http://url.tar.gz',
        windows: 'http://url.exe.zip',
      });

      //, { platform: 'linux' }

      expect(url).toEqual('http://url.tar.gz');
    });

    it('should get specific url for current platform and architecture', () => {
      const url = getUrl({
        default: 'http://url.tar.gz',
        windows: 'http://url.exe.zip',
        darwin: {
          default: 'http://url_darwin.tar.gz',
          386: 'http://url_darwin_i386.tar.gz',
        },
      });
      //  { platform: 'darwin', arch: 'ia32' }

      expect(url).toEqual('http://url_darwin_i386.tar.gz');
    });

    it('should get default url for current platform and architecture', () => {
      const url = getUrl({
        default: 'http://url.tar.gz',
        windows: 'http://url.exe.zip',
        darwin: {
          default: 'http://url_darwin.tar.gz',
          386: 'http://url_darwin_i386.tar.gz',
        },
      });
      //, { platform: 'darwin', arch: 'amd64' }

      expect(url).toEqual('http://url_darwin.tar.gz');
    });
  });

  describe('parsePackageJson()', () => {
    let _process;

    beforeEach(() => {
      _process = { ...global.process };
    });

    afterEach(() => {
      global.process = _process;
    });

    describe('validation', () => {
      it('should return if architecture is unsupported', () => {
        // @ts-ignore
        process.arch = 'mips';

        expect(parsePackageJson()).toBeUndefined();
      });

      it('should return if platform is unsupported', () => {
        // @ts-ignore
        process.platform = 'amiga';

        expect(parsePackageJson()).toBeUndefined();
      });

      it('should return if package.json does not exist', () => {
        // fs.existsSync.mockReturnValueOnce(false);

        expect(parsePackageJson()).toBeUndefined();
      });
    });

    describe('variable replacement', () => {
      it('should append .exe extension on windows platform', () => {
        // fs.existsSync.mockReturnValueOnce(true);
        // fs.readFileSync.mockReturnValueOnce(JSON.stringify({
        //   version: '1.0.0',
        //   goBinary: {
        //     name: 'command',
        //     path: './bin',
        //     url: 'https://github.com/foo/bar/releases/v{{version}}/assets/command{{win_ext}}'
        //   }
        // }));

        // @ts-ignore
        process.platform = 'win32';

        expect(parsePackageJson()).toMatchObject({
          binName: 'command.exe',
          url: 'https://github.com/foo/bar/releases/v1.0.0/assets/command.exe',
        });
      });

      it('should not append .exe extension on platform different than windows', () => {
        // fs.existsSync.mockReturnValueOnce(true);
        // fs.readFileSync.mockReturnValueOnce(JSON.stringify({
        //   version: '1.0.0',
        //   goBinary: {
        //     name: 'command',
        //     path: './bin',
        //     url: 'https://github.com/foo/bar/releases/v{{version}}/assets/command{{win_ext}}'
        //   }
        // }));

        // @ts-ignore
        process.platform = 'darwin';

        expect(parsePackageJson()).toMatchObject({
          binName: 'command',
          url: 'https://github.com/foo/bar/releases/v1.0.0/assets/command',
        });
      });
    });
  });
});
