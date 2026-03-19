const db = require('../config/db');

// ================= TENANT =================

// Add food order
exports.addMeal = (req, res) => {
  const tenantId = req.user.tenant_id;
  const { veg, non_veg, meal_time } = req.body;

  if (!meal_time) {
    return res.status(400).json({ message: "Meal time required" });
  }

  const sql = `
    INSERT INTO food (tenant_id, veg, non_veg, meal_time, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(sql, [tenantId, veg || 0, non_veg || 0, meal_time], (err) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json({ message: "Food ordered successfully" });
  });
};


// View own orders
exports.getMyMeals = (req, res) => {
  const tenantId = req.user.tenant_id;

  const sql = `
    SELECT veg, non_veg, meal_time, created_at
    FROM food
    WHERE tenant_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [tenantId], (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results || []);
  });
};


// ================= ADMIN =================

// View all orders
exports.getAllMeals = (req, res) => {
  const sql = `
    SELECT 
      f.id,
      t.name AS tenant_name,
      t.room_no,
      f.veg,
      f.non_veg,
      f.meal_time,
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

    res.json(results || []);
  });
};
