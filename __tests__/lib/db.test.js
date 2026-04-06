// ============================================
// Tests for lib/db.js
// ============================================

// Mock sqlite3 before requiring db module
const mockRun = jest.fn();
const mockGet = jest.fn();
const mockAll = jest.fn();
const mockDatabase = jest.fn();

jest.mock('sqlite3', () => ({
  verbose: () => ({
    Database: jest.fn((path, callback) => {
      mockDatabase(path);
      const dbInstance = {
        run: mockRun,
        get: mockGet,
        all: mockAll
      };
      // Simulate async callback
      if (callback) setTimeout(() => callback(null), 0);
      return dbInstance;
    })
  })
}));

// Mock fs to avoid actual filesystem operations
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

const { run, get, all, logAction } = require('../../lib/db');

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================
// run() - promisified db.run
// ============================================
describe('run', () => {
  test('resolves with lastID and changes on success', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({ lastID: 42, changes: 1 }, null);
    });

    const result = await run('INSERT INTO test VALUES (?)', ['value']);
    expect(result).toEqual({ id: 42, changes: 1 });
  });

  test('rejects on database error', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({}, new Error('SQLITE_CONSTRAINT'));
    });

    await expect(run('INSERT INTO test VALUES (?)', ['value']))
      .rejects.toThrow('SQLITE_CONSTRAINT');
  });

  test('uses empty array for default params', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({ lastID: 1, changes: 0 }, null);
    });

    await run('SELECT 1');
    expect(mockRun).toHaveBeenCalledWith('SELECT 1', [], expect.any(Function));
  });
});

// ============================================
// get() - promisified db.get
// ============================================
describe('get', () => {
  test('resolves with row on success', async () => {
    const mockRow = { id: 1, ticker: 'BTC', name: 'Bitcoin' };
    mockGet.mockImplementation((sql, params, callback) => {
      callback(null, mockRow);
    });

    const result = await get('SELECT * FROM researches WHERE id = ?', ['1']);
    expect(result).toEqual(mockRow);
  });

  test('resolves with undefined when no row found', async () => {
    mockGet.mockImplementation((sql, params, callback) => {
      callback(null, undefined);
    });

    const result = await get('SELECT * FROM researches WHERE id = ?', ['nonexistent']);
    expect(result).toBeUndefined();
  });

  test('rejects on database error', async () => {
    mockGet.mockImplementation((sql, params, callback) => {
      callback(new Error('SQLITE_ERROR'));
    });

    await expect(get('INVALID SQL'))
      .rejects.toThrow('SQLITE_ERROR');
  });
});

// ============================================
// all() - promisified db.all
// ============================================
describe('all', () => {
  test('resolves with array of rows', async () => {
    const mockRows = [
      { id: 1, ticker: 'BTC' },
      { id: 2, ticker: 'ETH' }
    ];
    mockAll.mockImplementation((sql, params, callback) => {
      callback(null, mockRows);
    });

    const result = await all('SELECT * FROM researches');
    expect(result).toEqual(mockRows);
    expect(result).toHaveLength(2);
  });

  test('resolves with empty array when no results', async () => {
    mockAll.mockImplementation((sql, params, callback) => {
      callback(null, []);
    });

    const result = await all('SELECT * FROM researches WHERE 1=0');
    expect(result).toEqual([]);
  });

  test('rejects on error', async () => {
    mockAll.mockImplementation((sql, params, callback) => {
      callback(new Error('table not found'));
    });

    await expect(all('SELECT * FROM nonexistent'))
      .rejects.toThrow('table not found');
  });
});

// ============================================
// logAction
// ============================================
describe('logAction', () => {
  test('inserts log entry with request headers', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({ lastID: 1, changes: 1 }, null);
    });

    const mockReq = {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0'
      }
    };

    await logAction('research_request', { input: 'BTC' }, mockReq);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO logs'),
      expect.arrayContaining([
        'research_request',
        expect.stringContaining('BTC'),
        '192.168.1.1',
        'Mozilla/5.0'
      ]),
      expect.any(Function)
    );
  });

  test('handles missing request gracefully', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({ lastID: 1, changes: 1 }, null);
    });

    // Should not throw
    await logAction('test_action', { data: 'test' }, null);

    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO logs'),
      expect.arrayContaining(['test_action', expect.any(String), 'unknown', 'unknown']),
      expect.any(Function)
    );
  });

  test('does not throw on database error (logs error silently)', async () => {
    mockRun.mockImplementation(function(sql, params, callback) {
      callback.call({}, new Error('DB error'));
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Should not throw
    await logAction('test_action', {}, null);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
