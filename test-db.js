require('dotenv').config();
const pool = require('./db');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected:', res.rows[0]);
  } catch (err) {
    console.error('Database connection failed:', err);
  } finally {
    process.exit();
  }
}

test();