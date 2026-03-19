const mysql = require('mysql2');

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Optional test
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Cloud Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to Aiven MySQL Cloud successfully!');
    if (connection) connection.release();
  }
});

module.exports = db;
