const db = require('../config/db');

// ================= TENANT =================

// Tenant: View own payments
exports.getTenantPayments = (req, res) => {
  const tenantId = req.user.tenant_id;

  const sql = `
    SELECT payment_id, amount, due_date, paid_on, status, late_by
    FROM payments
    WHERE tenant_id = ?
    ORDER BY due_date DESC
  `;

  db.query(sql, [tenantId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// ================= ADMIN =================

// Admin: View all payments
exports.getAllPayments = (req, res) => {
  const sql = `
    SELECT 
      p.payment_id,
      t.name AS tenant_name,
      t.room_no,
      p.amount,
      p.due_date,
      p.paid_on,
      p.status,
      p.late_by
    FROM payments p
    JOIN tenants t ON p.tenant_id = t.tenant_id
    ORDER BY p.due_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Admin: Mark payment as PAID
exports.markPaymentPaid = (req, res) => {
  const paymentId = req.params.id;

  const sql = `
    UPDATE payments
    SET 
      paid_on = CURDATE(),
      late_by = GREATEST(DATEDIFF(CURDATE(), due_date), 0),
      status = IF(DATEDIFF(CURDATE(), due_date) > 0, 'LATE', 'PAID')
    WHERE payment_id = ?
  `;

  db.query(sql, [paymentId], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Payment marked as paid' });
  });
};
