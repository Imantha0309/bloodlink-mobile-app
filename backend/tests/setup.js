// Tests run against a local SQLite file so `npm test` works with no external services.
// Override with DB_DIALECT=mysql (plus the usual DB_* vars) to test against MySQL.
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
process.env.DB_NAME = process.env.DB_NAME || 'bloodlink_test';
process.env.DB_STORAGE = process.env.DB_STORAGE || ':memory:';
process.env.DB_LOGGING = 'false';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

jest.setTimeout(30000);
