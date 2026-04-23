const db = require("../config/db");

// 🧑 Tenant: Create request
exports.createRequest = async (req, res) => {
  try {
    const { room_type, reason } = req.body;
    const tenant_id = req.user.id;

    await db.query(
      "INSERT INTO room_requests (tenant_id, room_type, reason, status) VALUES (?, ?, ?, 'PENDING')",
      [tenant_id, room_type, reason]
    );

    res.json({ message: "Request submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating request" });
  }
};

// 🧑 Tenant: Get own requests
exports.getMyRequests = async (req, res) => {
  try {
    const tenant_id = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM room_requests WHERE tenant_id = ? ORDER BY created_at DESC",
      [tenant_id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// 👨‍💼 Admin: Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, t.name 
      FROM room_requests r
      JOIN tenants t ON r.tenant_id = t.id
      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all requests" });
  }
};

// 👨‍💼 Admin: Approve / Reject + Comment
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;

    await db.query(
      "UPDATE room_requests SET status = ?, admin_comment = ? WHERE id = ?",
      [status, comment, req.params.id]
    );

    res.json({ message: "Request updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating request" });
  }
};

// 🔥 Admin: Assign room
exports.assignRoom = async (req, res) => {
  try {
    const { room_id } = req.body;
    const request_id = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM room_requests WHERE id = ?",
      [request_id]
    );

    const request = rows[0];

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({ message: "Request not approved yet" });
    }

    // Assign room to tenant
    await db.query(
      "UPDATE tenants SET room_id = ? WHERE id = ?",
      [room_id, request.tenant_id]
    );

    // Update request
    await db.query(
      "UPDATE room_requests SET assigned_room_id = ?, status = 'COMPLETED' WHERE id = ?",
      [room_id, request_id]
    );

    res.json({ message: "Room assigned successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error assigning room" });
  }
};
