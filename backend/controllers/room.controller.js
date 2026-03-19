const db = require('../config/db');

const MAX_CAPACITY = 4;

// Admin: View all rooms
exports.getAllRooms = (req, res) => {
  db.query('SELECT * FROM rooms ORDER BY floor, room_no', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// Admin: Assign tenant to room
exports.assignRoom = (req, res) => {
  const { tenant_id, room_no } = req.body;

  // 1. Check room availability
  db.query(
    'SELECT occupants FROM rooms WHERE room_no = ?',
    [room_no],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(400).json({ message: 'Room not found' });

      if (result[0].occupants >= MAX_CAPACITY)
        return res.status(400).json({ message: 'Room full' });

      // 2. Assign room to tenant
      db.query(
        'UPDATE tenants SET room_no = ? WHERE tenant_id = ?',
        [room_no, tenant_id],
        err => {
          if (err) return res.status(500).json(err);

          // 3. Update room occupancy
          db.query(
            `UPDATE rooms
             SET occupants = occupants + 1,
                 available_space = ? - (occupants + 1)
             WHERE room_no = ?`,
            [MAX_CAPACITY, room_no],
            err => {
              if (err) return res.status(500).json(err);
              res.json({ message: 'Room assigned successfully' });
            }
          );
        }
      );
    }
  );
};
