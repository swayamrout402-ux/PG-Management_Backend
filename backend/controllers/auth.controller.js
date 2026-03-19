const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';

// ================= TENANT REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO tenants (name, email, password_hash, phone, joining_date)
      VALUES (?, ?, ?, ?, CURDATE())
    `;

    db.query(sql, [name, email, hash, phone], err => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Email already registered' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Tenant registered successfully' });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// TENANT LOGIN 
exports.login = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    db.query(
      'SELECT * FROM tenants WHERE email = ?',
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (!result || result.length === 0) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const tenant = result[0];

        const match = await bcrypt.compare(password, tenant.password_hash);
        if (!match) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        //  JWT MUST INCLUDE tenant_id
        const token = jwt.sign(
          {
            tenant_id: tenant.tenant_id,
            role: 'tenant'
          },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        res.json({
          message: 'Login successful',
          token,
          role: 'tenant'
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
