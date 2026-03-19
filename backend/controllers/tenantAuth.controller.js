const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO tenants (name, email, password_hash, phone)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, hashedPassword, phone], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Tenant registered successfully' });
  });
};

// LOGIN
exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM tenants WHERE email = ?`;

  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const tenant = results[0];

    const isMatch = await bcrypt.compare(password, tenant.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { tenant_id: tenant.tenant_id },
      'SECRET_KEY',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token
    });
  });
};
