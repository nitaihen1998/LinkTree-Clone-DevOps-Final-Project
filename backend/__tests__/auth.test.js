/**
 * Backend Authentication Tests
 * 
 * Purpose: Tests critical user authentication functionality
 * Tests that verify:
 * - User creation with valid credentials
 * - Password hashing before database storage
 * - Validation of required fields (email, password)
 * 
 * Test Type: API/Integration Tests
 * Test Framework: Jest + Mongoose
 * Database: MongoDB (provided by CI/CD service)
 * 
 * These tests run during:
 * - Local development: npm test
 * - CI/CD Pipeline: npm test (before deployment)
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');

const validUser = {
  username: `testuser-${Date.now()}`,
  email: `test-${Date.now()}@example.com`,
  password: 'SecurePass123!',
};

describe('User Authentication', () => {
  afterEach(async () => {
    // Clean up test data after each test to prevent test pollution
    await User.deleteMany({ username: new RegExp('^testuser-') });
  });

  test('should create user with valid credentials', async () => {
    const user = new User(validUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.email).toBe(validUser.email);
  });

  test('should hash password before storage', async () => {
    const user = new User(validUser);
    await user.save();

    expect(user.password).not.toBe(validUser.password);
    const isMatch = await bcrypt.compare(validUser.password, user.password);
    expect(isMatch).toBe(true);
  });

  test('should require mandatory fields', async () => {
    const incompleteUser = new User({
      username: validUser.username,
      // missing email and password
    });

    const error = incompleteUser.validateSync();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });
});



