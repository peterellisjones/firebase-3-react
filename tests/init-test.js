
// it should work using both "import" and "require" syntax
import { init } from "../dist/index.js";

require('firebase').initializeApp = jest.fn(() => {
  return {
    database: () => { return {}; },
    auth: () => { return {}; },
    storage: () => { return {}; },
  };
});

describe('database', () => {
  describe('when init has been called', () => {
    const { database } = require('../dist/index.js');


    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { database(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { database } = require('../dist/index.js');

      expect(() => { database(); }).toThrowError('Database not initialized, did you forget to call init?');
    });
  });
});

describe('auth', () => {
  describe('when init has been called', () => {
    const { auth } = require('../dist/index.js');

    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { auth(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { auth } = require('../dist/index.js');

      expect(() => { auth(); }).toThrowError('Auth not initialized, did you forget to call init?');
    });
  });
});

describe('storage', () => {
  describe('when init has been called', () => {
    const { storage } = require('../dist/index.js');

    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { storage(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { storage } = require('../dist/index.js');

      expect(() => { storage(); }).toThrowError('Storage not initialized, did you forget to call init?');
    });
  });
});
