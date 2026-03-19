const mysql = require('mysql2');

// Create a connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',          // your MySQL username
  password: '260906', // your MySQL password
  database: 'pg_managementfinal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: Test connection immediately
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Failed:', err);
  } else {
    console.log('MySQL Connected Successfully');
    connection.release();
  }
});

module.exports = db;
