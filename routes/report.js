const express = require('express');
const router = express.Router();

// 📊 GET /report — View consolidated hostel reports
router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const [studentCount] = await pool.execute('SELECT COUNT(*) AS count FROM students');
    const [roomStats] = await pool.execute('SELECT COUNT(*) AS total, SUM(occupancy) AS occupied FROM rooms');
    const [unpaidFees] = await pool.execute("SELECT COUNT(*) AS count FROM fees WHERE status = 'Unpaid'");
    const [paidFeesTotal] = await pool.execute("SELECT SUM(amount + mess_fees) AS total FROM fees WHERE status = 'Paid'");
    
    res.render('report', {
      totalStudents: studentCount[0].count,
      totalRooms: roomStats[0].total,
      occupiedRooms: roomStats[0].occupied,
      unpaidFees: unpaidFees[0].count,
      paidFeesTotal: Number(paidFeesTotal[0].total || 0)
    });

  } catch (err) {
    console.error('❌ Report fetch error:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
