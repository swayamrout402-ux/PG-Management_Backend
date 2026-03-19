// ===================== IMPORTS =====================
const express = require('express');
const cors = require('cors');

const app = express();

// ===================== MIDDLEWARE =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "https://swayamrout402-ux.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ===================== DATABASE =====================
const db = require('./config/db');

// Optional: Test DB connection (safe for Vercel)
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  } else {
    console.log('✅ MySQL Connected Successfully');
    if (connection) connection.release();
  }
});

// ===================== ROUTES =====================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tenants', require('./routes/tenant.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/food', require('./routes/food.routes'));

// ✅ ROOT ROUTE (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ===================== ERROR HANDLING =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

// ✅ EXPORT ONLY (NO app.listen)
// ===================== START SERVER =====================
// Render provides a port via process.env.PORT. 
// We default to 3000 for local development.
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Access locally at http://localhost:${PORT}`);
});

// Optional: Keep this if you use this file in a test suite, 
// but the app.listen above is what Render needs to stay alive.
module.exports = app;

