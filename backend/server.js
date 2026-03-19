// ===================== IMPORTS =====================
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ===================== SERVE FRONTEND =====================
app.use(express.static(path.join(__dirname, '../frontend')));

// ===================== DATABASE =====================
const db = require('./config/db');

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL Connection Failed:', err);
    process.exit(1);
  }
  console.log('MySQL Connected Successfully');
  connection.release();
});

// ===================== ROOT ROUTE =====================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ===================== ROUTES =====================

// Auth routes
app.use('/api/auth', require('./routes/auth.routes'));

// Tenant routes
app.use('/api/tenants', require('./routes/tenant.routes'));

// Complaints routes
app.use('/api/complaints', require('./routes/complaint.routes'));

// Admin routes
app.use('/api/admin', require('./routes/admin.routes'));

// Food routes
app.use('/api/food', require('./routes/food.routes'));

// ===================== FRONTEND FALLBACK =====================
// IMPORTANT: This replaces your 404 JSON
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ===================== ERROR HANDLING =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// ===================== START SERVER =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// ===================== VERCEL EXPORT =====================
// THIS IS REQUIRED FOR VERCEL TO WORK
module.exports = app;