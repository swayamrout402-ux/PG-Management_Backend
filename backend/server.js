// ===================== IMPORTS =====================
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FIXED CORS: Explicitly allow your GitHub Pages frontend
app.use(cors({
  origin: "https://swayamrout402-ux.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ===================== DATABASE =====================
const db = require('./config/db');

// Test DB connection
// Note: We removed process.exit(1) so the Vercel function doesn't crash 
// if the DB takes a second to wake up.
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Connected Successfully');
    connection.release();
  }
});

// ===================== ROUTES =====================
// These stay exactly the same
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tenants', require('./routes/tenant.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/food', require('./routes/food.routes'));

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
module.exports = app;
