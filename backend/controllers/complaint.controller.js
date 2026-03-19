const db = require('../config/db');

// ================= COMPLAINT CONTROLLER =================

// Tenant create complaint
exports.createComplaint = (req, res) => {
  if (!req.user || !req.user.tenant_id) {
    return res.status(401).json({ message: "Unauthorized: tenant not found" });
  }

  const tenantId = req.user.tenant_id;
  const { title, description } = req.body;

  console.log("Tenant ID:", tenantId);
  console.log("Title:", title);
  console.log("Description:", description);

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description are required" });
  }

  db.query(
    `INSERT INTO complaints (tenant_id, title, description, created_at, status, resolved_at)
     VALUES (?, ?, ?, NOW(), 'OPEN', NULL)`,
    [tenantId, title, description],
    (err, result) => {
      if (err) {
        console.error("DB ERROR:", err);
        return res.status(500).json({ message: "Database error", error: err.sqlMessage });
      }
      res.json({ message: "Complaint created", complaintId: result.insertId });
    }
  );
};

// Tenant view complaints
exports.getTenantComplaints = (req, res) => {
  if (!req.user || !req.user.tenant_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  db.query(
    'SELECT * FROM complaints WHERE tenant_id = ?',
    [req.user.tenant_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.sqlMessage });
      res.json(result);
    }
  );
};

// Admin view all
exports.getAllComplaints = (req, res) => {
  db.query('SELECT * FROM complaints', (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err.sqlMessage });
    res.json(result);
  });
};

// Admin resolve
exports.resolveComplaint = (req, res) => {
  db.query(
    `UPDATE complaints 
     SET status='RESOLVED', resolved_at=NOW() 
     WHERE complaint_id=?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.sqlMessage });
      res.json({ message: 'Resolved' });
    }
  );
};

// Analytics
exports.getAverageResolutionTime = (req, res) => {
  db.query(
    `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) 
     AS avg_resolution_hours 
     FROM complaints WHERE status='RESOLVED'`,
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.sqlMessage });
      res.json(result[0]);
    }
  );
};
