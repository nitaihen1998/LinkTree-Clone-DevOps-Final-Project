#!/usr/bin/env node

/**
 * MongoDB Atlas Connection Verification Script
 * Run with: node verify-mongodb.js
 */
/* eslint-disable no-console */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyConnection() {
  console.log('🔍 MongoDB Atlas Connection Verification\n');
  console.log('-------------------------------------------\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI not found in environment variables');
    console.log('   Make sure config/.env exists and contains MONGO_URI');
    process.exit(1);
  }

  // Mask the URI for security
  const maskedUri = process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@');
  console.log(`✅ MONGO_URI found`);
  console.log(`   ${maskedUri}\n`);

  // Try to connect
  console.log('🔗 Attempting MongoDB Connection...\n');
  try {
    const startTime = Date.now();
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Connection Successful!\n');
    console.log('📊 Connection Details:');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Port: ${conn.connection.port}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Connection Time: ${connectionTime}ms\n`);

    // Try to ping the server
    console.log('🏓 Pinging Server...');
    const adminDb = mongoose.connection.db.admin();
    await adminDb.ping();
    console.log('✅ Server Ping Successful\n');

    // List collections
    console.log('📦 Collections in Database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('   (No collections yet - they will be created on first write)\n');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      console.log('');
    }

    console.log('-------------------------------------------');
    console.log('✅ All checks passed! MongoDB Atlas is working correctly.\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection Failed!\n');
    console.error('Error Details:');
    console.error(`   Type: ${error.name}`);
    console.error(`   Message: ${error.message}\n`);

    // Provide troubleshooting suggestions
    console.log('💡 Troubleshooting Tips:\n');

    if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.log('   • This looks like a network/DNS issue');
      console.log('   • Check your internet connection');
      console.log('   • Verify your IP is whitelisted in MongoDB Atlas');
      console.log('   • Go to: Cluster > Security > Network Access');
    }

    if (error.message.includes('Authentication failed') || error.message.includes('authentication')) {
      console.log('   • This looks like an authentication issue');
      console.log('   • Verify username and password in MONGO_URI');
      console.log('   • Special characters must be URL-encoded');
      console.log('   • Use MongoDB Atlas URI builder to generate correct string');
    }

    if (error.message.includes('Invalid URI')) {
      console.log('   • This looks like a URI format issue');
      console.log('   • Correct format:');
      console.log('     mongodb+srv://username:password@cluster.mongodb.net/database');
    }

    console.log('\n   📖 See MONGODB_SETUP.md for detailed troubleshooting guide\n');

    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

verifyConnection();
