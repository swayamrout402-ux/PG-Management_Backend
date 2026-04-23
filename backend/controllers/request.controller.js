const db = require('../config/db');

// ================= TENANT: CREATE REQUEST =================
exports.createRequest = (req, res) => {
  try {
    const { room_type, reason } = req.body;

    // ✅ get tenant_id from token
    const tenant_id = req.user.tenant_id;

    const sql = `
      INSERT INTO room_requests (tenant_id, room_type, reason, status)
      VALUES (?, ?, ?, 'PENDING')
    `;

    db.query(sql, [tenant_id, room_type, reason], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({ message: 'Request submitted successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= TENANT: GET MY REQUESTS =================
exports.getMyRequests = (req, res) => {
  const tenant_id = req.user.tenant_id;

  const sql = `
    SELECT * FROM room_requests
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [tenant_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json(results);
  });
};

// ================= ADMIN: GET ALL REQUESTS =================
exports.getAllRequests = (req, res) => {
  const sql = `
    SELECT r.*, t.name
    FROM room_requests r
    JOIN tenants t ON r.tenant_id = t.tenant_id
    ORDER BY r.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json(results);
  });
};

// ================= ADMIN: APPROVE / REJECT =================
exports.updateRequestStatus = (req, res) => {
  const { status, comment } = req.body;
  const request_id = req.params.id;

  const sql = `
    UPDATE room_requests
    SET status = ?, admin_comment = ?
    WHERE id = ?
  `;

  db.query(sql, [status, comment, request_id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json({ message: 'Request updated successfully' });
  });
};

// ================= ADMIN: ASSIGN ROOM =================
exports.assignRoom = (req, res) => {
  const { room_id } = req.body;
  const request_id = req.params.id;

  // 1. Get request
  const getRequestSql = `SELECT * FROM room_requests WHERE id = ?`;

  db.query(getRequestSql, [request_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = results[0];

    if (request.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Request not approved yet' });
    }

    // 2. Assign room to tenant
    const updateTenantSql = `
      UPDATE tenants SET room_id = ?
      WHERE tenant_id = ?
    `;

    db.query(updateTenantSql, [room_id, request.tenant_id], (err) => {
      if (err) return res.status(500).json({ message: 'Error updating tenant' });

      // 3. Update request
      const updateRequestSql = `
        UPDATE room_requests
        SET assigned_room_id = ?, status = 'COMPLETED'
        WHERE id = ?
      `;

      db.query(updateRequestSql, [room_id, request_id], (err) => {
        if (err) return res.status(500).json({ message: 'Error updating request' });

        res.json({ message: 'Room assigned successfully' });
      });
    });
  });
};
