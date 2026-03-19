const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ================= ADMIN REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO admins (name, email, admin_password_hash, phone, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(sql, [name, email, hash, phone], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email already registered' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ message: 'Admin registered successfully' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= ADMIN LOGIN =================
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const sql = `SELECT * FROM admins WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.admin_password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '1d' }
    );

    res.json({ message: 'Admin login successful', token });
  });
};
