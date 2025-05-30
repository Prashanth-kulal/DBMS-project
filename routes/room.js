const express = require('express');
const router = express.Router();

// Display all rooms
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rooms] = await pool.execute('SELECT * FROM rooms');
    res.render('room', { rooms });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).send('Server Error');
  }
});

// Add a new room
router.post('/add', async (req, res) => {
  const { room_no, capacity, occupancy, type } = req.body;
  try {
    const pool = req.app.locals.pool;
    await pool.execute(
      'INSERT INTO rooms (room_no, capacity, occupancy, type) VALUES (?, ?, ?, ?)',
      [room_no, capacity, occupancy, type]
    );
    res.redirect('/room');
  } catch (err) {
    console.error('Error adding room:', err);
    res.status(500).send('Server Error');
  }
});

// Edit a room
router.post('/edit', async (req, res) => {
  const { room_no, capacity, occupancy, type } = req.body;
  try {
    const pool = req.app.locals.pool;
    await pool.execute(
      'UPDATE rooms SET capacity = ?, occupancy = ?, type = ? WHERE room_no = ?',
      [capacity, occupancy, type, room_no]
    );
    res.redirect('/room');
  } catch (err) {
    console.error('Error editing room:', err);
    res.status(500).send('Server Error');
  }
});

// Delete a room
router.post('/delete', async (req, res) => {
  const { room_no } = req.body;
  try {
    const pool = req.app.locals.pool;
    await pool.execute('DELETE FROM rooms WHERE room_no = ?', [room_no]);
    res.redirect('/room');
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
