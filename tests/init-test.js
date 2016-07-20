require('firebase').initializeApp = jest.fn(() => {
  return {
    database: () => { return {}; },
    auth: () => { return {}; },
    storage: () => { return {}; },
  };
});

describe('database', () => {
  describe('when init has been called', () => {
    const { init, database } = require('../dist/init.js');

    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { database(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { database } = require('../dist/init.js');

      expect(() => { database(); }).toThrowError('Database not initialized, did you forget to call init?');
    });
  });
});

describe('auth', () => {
  describe('when init has been called', () => {
    const { init, auth } = require('../dist/init.js');

    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { auth(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { auth } = require('../dist/init.js');

      expect(() => { auth(); }).toThrowError('Auth not initialized, did you forget to call init?');
    });
  });
});

describe('storage', () => {
  describe('when init has been called', () => {
    const { init, storage } = require('../dist/init.js');

    beforeEach(() => { init(); });

    it('does not raise an error', () => {
      expect(() => { storage(); }).not.toThrow();
    });
  });

  describe('when init has not been called', () => {
    it('raises an error', () => {
      const { storage } = require('../dist/init.js');

      expect(() => { storage(); }).toThrowError('Storage not initialized, did you forget to call init?');
    });
  });
});
