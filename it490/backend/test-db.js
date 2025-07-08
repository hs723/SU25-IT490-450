
// test-db.js - Test your database connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'trivia_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'trivia_app',
    port: process.env.DB_PORT || 3306
  };

  console.log('📋 Connection config:');
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Port: ${dbConfig.port}\n`);

  try {
    // Test connection
    console.log('🔗 Attempting to connect...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully!\n');

    // Test database exists
    console.log('📊 Testing database access...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === dbConfig.database);
    
    if (dbExists) {
      console.log(`✅ Database '${dbConfig.database}' exists\n`);
    } else {
      console.log(`❌ Database '${dbConfig.database}' not found\n`);
      await connection.end();
      return;
    }

    // Test tables
    console.log('📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    if (tables.length > 0) {
      console.log('✅ Tables found:');
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No tables found\n');
    }

    // Test users table specifically
    try {
      const [columns] = await connection.execute('DESCRIBE users');
      console.log('✅ Users table structure:');
      columns.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
      });
      console.log('');
    } catch (error) {
      console.log('❌ Users table not found or inaccessible\n');
    }

    // Test insert (optional)
    try {
      console.log('🧪 Testing insert operation...');
      const testEmail = `test_${Date.now()}@example.com`;
      
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        ['Test User', testEmail, 'hashed_password_here']
      );
      
      console.log(`✅ Test user inserted with ID: ${result.insertId}`);
      
      // Clean up test data
      await connection.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
      console.log('🧹 Test data cleaned up\n');
      
    } catch (error) {
      console.log(`❌ Insert test failed: ${error.message}\n`);
    }

    // Show current users count
    try {
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM users');
      console.log(`📊 Current users in database: ${count[0].total}\n`);
    } catch (error) {
      console.log(`❌ Could not count users: ${error.message}\n`);
    }

    await connection.end();
    console.log('🎉 All tests completed successfully!');
    console.log('👍 Your database is ready to use with the registration form.');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'Unknown'}\n`);
    
    // Provide helpful suggestions
    console.log('💡 Troubleshooting suggestions:');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   - Check your username and password in .env file');
      console.log('   - Make sure the user has proper privileges');
      console.log('   - Try: GRANT ALL PRIVILEGES ON trivia_app.* TO \'trivia_user\'@\'localhost\';');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   - Make sure MySQL is running: brew services start mysql');
      console.log('   - Check if the port is correct (default: 3306)');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('   - Database does not exist. Create it with: CREATE DATABASE trivia_app;');
    } else {
      console.log('   - Verify MySQL is installed and running');
      console.log('   - Check your .env file configuration');
      console.log('   - Try connecting manually: mysql -u trivia_user -p trivia_app');
    }
  }
}

// Run the test
testDatabase();