import { assertIn } from './asserts';

describe('asserts', () => {
  describe('assertIn', () => {
    const obj = { install: '1', uninstall: '1' };

    it('should throw error when key not in object', () => {
      expect(() => assertIn('other', obj))
        .toThrowError('Value \'other\' is not allowed.');
    });

    it('should do nothing when key in object', () => {
      expect(() => assertIn('install', obj))
        .not.toThrowError();
    });

    it('should throw error with custom message if passed', () => {
      expect(() => assertIn('other', obj, 'test-message'))
        .toThrowError('test-message');
    });
  });
});
