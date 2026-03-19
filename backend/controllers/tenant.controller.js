const db = require('../config/db');

// ================= TENANT DASHBOARD =================
exports.dashboard = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const sql = `
    SELECT 
      t.name,
      t.age,
      t.phone,
      r.room_no,
      t.joining_date,
      t.vacate_date
    FROM tenants t
    LEFT JOIN rooms r ON t.room_id = r.room_id
    WHERE t.tenant_id = ?
  `;

  db.query(sql, [tenantId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(result[0] || {});
  });
};

// ================= PAYMENTS =================

// Tenant: view own payments
exports.getPayments = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const sql = `
    SELECT 
      payment_id,
      amount,
      payment_mode,
      reference_id,
      status,
      created_at
    FROM payments
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [tenantId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(results || []);
  });
};

// Tenant: submit payment (PENDING → admin approval)
exports.addPayment = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const { amount, payment_mode, reference_id } = req.body;

  if (!amount || !payment_mode) {
    return res.status(400).json({ message: 'Amount and payment mode required' });
  }

  const sql = `
    INSERT INTO payments (
      tenant_id,
      amount,
      payment_mode,
      reference_id,
      status
    )
    VALUES (?, ?, ?, ?, 'PENDING')
  `;

  db.query(
    sql,
    [tenantId, amount, payment_mode, reference_id || null],
    (err) => {
      if (err) {
        console.error('Payment insert error:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        message: 'Payment submitted successfully and awaiting admin approval'
      });
    }
  );
};

// ================= COMPLAINTS =================

exports.getComplaints = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  db.query(
    `SELECT * FROM complaints WHERE tenant_id = ? ORDER BY created_at DESC`,
    [tenantId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json(results || []);
    }
  );
};

exports.addComplaint = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: 'All fields required' });
  }

  db.query(
    `INSERT INTO complaints (tenant_id, title, description, status)
     VALUES (?, ?, ?, 'PENDING')`,
    [tenantId, title, description],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Complaint submitted successfully' });
    }
  );
};

// ================= VACATE NOTICE =================

exports.sendNotice = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const { vacate_date, reason } = req.body;

  if (!vacate_date || !reason) {
    return res.status(400).json({ message: 'All fields required' });
  }

  db.query(
    `INSERT INTO vacate_notices (tenant_id, vacate_date, reason, status)
     VALUES (?, ?, ?, 'PENDING')`,
    [tenantId, vacate_date, reason],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Vacate notice sent to admin' });
    }
  );
};

exports.getNotice = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  db.query(
    `SELECT * FROM vacate_notices WHERE tenant_id = ?`,
    [tenantId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json(results[0] || null);
    }
  );
};
// ================= ALERTS =================
exports.getMyAlerts = (req, res) => {
  const tenantId = req.user?.tenant_id;

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID missing in token' });
  }

  const sql = `
    SELECT alert_id, alert_type, message, created_at
    FROM alerts
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [tenantId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json(results || []);
  });
};







