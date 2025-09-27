// Test setup file to run before all tests
const { initializeDatabase, closeDatabase } = require('../src/config/database');

// Set test environment
process.env.NODE_ENV = 'test';

// Global test setup
beforeAll(async () => {
  // Initialize in-memory database for testing
  await initializeDatabase();
});

// Global test cleanup
afterAll(async () => {
  // Close database connection after all tests
  await closeDatabase();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});