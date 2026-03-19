const db = require('../config/db');

// Tenant views their alerts
exports.getTenantAlerts = (req, res) => {
  const tenantId = req.user.tenant_id;

  const sql = `
    SELECT alert_id, alert_type, message, created_at
    FROM alerts
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [tenantId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Admin creates an alert for a tenant
exports.createAlert = (req, res) => {
  const { tenant_id, alert_type, message } = req.body;

  const sql = `
    INSERT INTO alerts (tenant_id, alert_type, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tenant_id, alert_type, message], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Alert created successfully' });
  });
};
