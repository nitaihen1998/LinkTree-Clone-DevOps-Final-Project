/**
 * Jest Setup File
 * Connects to MongoDB before tests run
 */
/* eslint-disable no-console */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/linktree-test';

beforeAll(async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
