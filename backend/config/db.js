const mysql = require('mysql2');

// ========================================================
// ⚠️ WARNING: Hardcoding passwords in your code can be 
// a security risk if your GitHub repo is Public.
// ========================================================
const db = mysql.createPool({
  host: 'mysql-pgmanagement-swayam.j.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_lSBF3uMIX_VdqEj18WB',
  database: 'defaultdb',
  port: 27928,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Required for Aiven Cloud Security
  ssl: {
    rejectUnauthorized: false 
  }
});

// Test the connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Cloud Connection Failed:', err.message);
  } else {
    console.log('✅ Connected to Aiven MySQL Cloud successfully!');
    if (connection) connection.release();
  }
});

module.exports = db;
