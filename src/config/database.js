const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_user', // your database user
  host: 'localhost', // your database host
  database: 'your_database', // your database name
  password: 'your_password', // your database password
  port: 5432, // your database port
});

module.exports = pool;