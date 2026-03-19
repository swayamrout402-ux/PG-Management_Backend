const db = require('../config/db');

// ================= TENANTS =================
exports.getAllTenants = (req, res) => {
  const sql = `
    SELECT tenant_id, name, age, email, phone, room_no, 
           joining_date, vacate_date, tenure_months, payment_status
    FROM tenants
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results || []);
  });
};

exports.assignRoom = (req, res) => {
  const tenantId = req.params.id;
  const { room_no } = req.body;

  if (!room_no) {
    return res.status(400).json({ message: "Room number required" });
  }

  // Step 1: Find room
  db.query(
    `SELECT * FROM rooms WHERE room_no = ?`,
    [room_no.trim()],
    (err, roomResult) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (roomResult.length === 0) {
        return res.status(404).json({ message: "Room not found" });
      }

      const room = roomResult[0];

      // Step 2: Check capacity
      db.query(
        `SELECT COUNT(*) AS count FROM tenants WHERE room_id = ?`,
        [room.room_id],
        (err, countResult) => {
          if (err) return res.status(500).json({ message: "Database error" });

          if (countResult[0].count >= room.capacity) {
            return res.status(400).json({ message: "Room is FULL" });
          }

          // Step 3: Assign room
          db.query(
            `UPDATE tenants SET room_no = ?, room_id = ? WHERE tenant_id = ?`,
            [room.room_no, room.room_id, tenantId],
            (err, result) => {
              if (err) return res.status(500).json({ message: "Database error" });

              if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Tenant not found" });
              }

              res.json({
                message: "Room assigned successfully",
                room_no: room.room_no
              });
            }
          );
        }
      );
    }
  );
};



// ================= PAYMENTS =================
exports.getAllPayments = (req, res) => {
  const sql = `
    SELECT 
      p.payment_id, 
      p.tenant_id, 
      p.amount, 
      p.payment_mode, 
      p.status, 
      p.created_at, 
      t.name AS tenant_name, 
      t.room_no
    FROM payments p
    JOIN tenants t ON p.tenant_id = t.tenant_id
    ORDER BY p.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results || []);
  });
};

exports.confirmPayment = (req, res) => {
  const paymentId = req.params.id;

  const updateSql = `
    UPDATE payments
    SET status='APPROVED'
    WHERE payment_id=? AND status='PENDING'
  `;

  db.query(updateSql, [paymentId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Payment not found or already processed'
      });
    }

    // Return the updated status
    res.json({ status: 'APPROVED', message: 'Payment approved successfully' });
  });
};


// ================= COMPLAINTS =================
exports.getAllComplaints = (req, res) => {
  const sql = `
    SELECT 
      c.complaint_id, 
      c.title, 
      c.description, 
      c.status, 
      c.created_at, 
      c.resolved_at,
      t.name AS tenant_name, 
      t.room_no
    FROM complaints c
    JOIN tenants t ON c.tenant_id = t.tenant_id
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results || []);
  });
};

exports.resolveComplaint = (req, res) => {
  const complaintId = req.params.id;

  const sql = `
    UPDATE complaints 
    SET status='RESOLVED', resolved_at=NOW()
    WHERE complaint_id=?
  `;

  db.query(sql, [complaintId], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Complaint resolved successfully' });
  });
};

exports.getComplaintAnalytics = (req, res) => {
  const sql = `
    SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) 
    AS avg_resolution_hours
    FROM complaints
    WHERE status='RESOLVED'
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(result[0] || { avg_resolution_hours: 0 });
  });
};

// ================= VACATE NOTICES =================
exports.getAllNotices = (req, res) => {
  const sql = `
    SELECT 
      v.notice_id, 
      v.tenant_id, 
      v.vacate_date, 
      v.reason, 
      v.status, 
      v.created_at,
      t.name AS tenant_name, 
      t.room_no
    FROM vacate_notices v
    JOIN tenants t ON v.tenant_id = t.tenant_id
    ORDER BY v.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results || []);
  });
};

exports.approveNotice = (req, res) => {
  const noticeId = req.params.id;

  const getNoticeSql = `
    SELECT tenant_id, vacate_date
    FROM vacate_notices
    WHERE notice_id=?
  `;

  db.query(getNoticeSql, [noticeId], (err, rows) => {
    if (err || rows.length === 0)
      return res.status(404).json({ message: 'Notice not found' });

    const { tenant_id, vacate_date } = rows[0];

    const approveSql = `
      UPDATE vacate_notices
      SET status='APPROVED'
      WHERE notice_id=?
    `;

    db.query(approveSql, [noticeId], (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const updateTenantSql = `
        UPDATE tenants
        SET vacate_date=?
        WHERE tenant_id=?
      `;

      db.query(updateTenantSql, [vacate_date, tenant_id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Vacate notice approved' });
      });
    });
  });
};

// ================= ROOMS =================
exports.getRoomOccupancy = (req, res) => {
  const sql = `
    SELECT room_no, room_type, max_occupants, current_occupants, status
    FROM rooms
    ORDER BY room_no
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results || []);
  });
};
// ================= ALERTS =================
exports.sendAlert = (req, res) => {
  const { tenant_id, alert_type, message } = req.body;

  if (!tenant_id || !alert_type || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const validTypes = ['PAYMENT', 'COMPLAINT', 'TENURE', 'NOTICE'];

  if (!validTypes.includes(alert_type)) {
    return res.status(400).json({ message: 'Invalid alert type' });
  }

  const sql = `
    INSERT INTO alerts (tenant_id, alert_type, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tenant_id, alert_type, message], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ message: 'Alert sent successfully' });
  });
};
//food
exports.getAllFoodOrders = (req, res) => {

    const sql = `
        SELECT 
            t.name AS tenant_name,
            t.room_no,
            f.meal_time,
            f.veg,
            f.non_veg,
            f.created_at
        FROM food f
        JOIN tenants t ON f.tenant_id = t.tenant_id
        ORDER BY f.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("DB ERROR:", err);
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};
//room
// admin.controller.js
exports.addRoom = (req, res) => {
  const { room_no, room_type, capacity } = req.body;

  if (!room_no || !room_type || !capacity) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = `
    INSERT INTO rooms (room_no, room_type, capacity)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [room_no, room_type, capacity], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Room already exists or DB error" });
    }

    res.json({ message: "Room added successfully" });
  });
};

exports.getRooms = (req, res) => {
  const sql = `
    SELECT 
      r.room_id,
      r.room_no,
      r.room_type,
      r.capacity,
      COUNT(t.tenant_id) AS occupied
    FROM rooms r
    LEFT JOIN tenants t ON r.room_id = t.room_id
    GROUP BY r.room_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    const rooms = results.map(r => ({
      ...r,
      remaining: r.capacity - r.occupied
    }));

    res.json(rooms);
  });
};

exports.getRoomTenants = (req, res) => {
  const { roomId } = req.params;

  const sql = `
    SELECT tenant_id, name, phone, joining_date, vacate_date
    FROM tenants
    WHERE room_id = ?
  `;

  db.query(sql, [roomId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.json(results);
  });
};

//remove tenant from room
exports.removeTenantFromRoom = (req, res) => {
  const { tenantId } = req.params;

  const sql = `
    UPDATE tenants
    SET room_id = NULL, room_no = NULL
    WHERE tenant_id = ?
  `;

  db.query(sql, [tenantId], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });

    res.json({ message: "Tenant removed from room" });
  });
};