const pool = require('../db');
const bcrypt = require('bcrypt');

async function findByUsername(username) {
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0];
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

module.exports = {
  findByUsername,
  verifyPassword
};