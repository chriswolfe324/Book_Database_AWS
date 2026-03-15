const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
  ssl: {
    rejectUnauthorized: false
  }
});

// Fail clearly if DB cannot connect at startup
pool.connect()
  .then(client => {
    console.log('PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('PostgreSQL connection failed:', err);
    process.exit(1);   // stop the app if DB is unavailable
  });

module.exports = pool;
