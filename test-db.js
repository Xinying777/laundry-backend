const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    console.log('\n2. Testing users table...');
    const usersResult = await client.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table exists, count:', usersResult.rows[0].count);
    
    console.log('\n3. Checking demo user...');
    const demoUser = await client.query('SELECT * FROM users WHERE student_id = $1', ['demo']);
    if (demoUser.rows.length > 0) {
      console.log('✅ Demo user found:', demoUser.rows[0]);
    } else {
      console.log('❌ Demo user not found!');
      console.log('All users in database:');
      const allUsers = await client.query('SELECT student_id, name FROM users');
      console.log(allUsers.rows);
    }
    
    client.release();
    console.log('\n✅ All tests completed!');
    
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
    console.error('Full error:', err);
  } finally {
    process.exit();
  }
}

testConnection();