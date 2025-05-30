const express = require('express');
const router = express.Router();

// 📃 GET: List all students
router.get('/', async (req, res) => {
  try {
    const [students] = await req.app.locals.pool.query('SELECT * FROM students');
    res.render('students/list', { students }); // ✅ corrected path
  } catch (err) {
    console.error('❌ Failed to fetch students:', err);
    res.status(500).send('Server error');
  }
});

// ➕ GET: Show form to add new student
router.get('/new', (req, res) => {
  res.render('students/add'); // ✅ corrected path
});

// ➕ POST: Add new student
router.post('/new', async (req, res) => {
  const { name, age, address, contact, room_no } = req.body;
  try {
    await req.app.locals.pool.query(
      'INSERT INTO students (name, age, address, contact, room_no) VALUES (?, ?, ?, ?, ?)',
      [name, age, address, contact, room_no]
    );
    res.redirect('/student');
  } catch (err) {
    console.error('❌ Error adding student:', err);
    res.status(500).send('Server error');
  }
});

// ✏️ GET: Edit student form
router.get('/edit/:id', async (req, res) => {
  try {
    const [rows] = await req.app.locals.pool.query(
      'SELECT * FROM students WHERE student_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).send('Student not found');
    res.render('students/edit', { student: rows[0] }); // ✅ corrected path
  } catch (err) {
    console.error('❌ Error fetching student:', err);
    res.status(500).send('Server error');
  }
});

// 💾 POST: Update student
router.post('/edit/:id', async (req, res) => {
  const { name, age, address, contact, room_no } = req.body;
  try {
    await req.app.locals.pool.query(
      'UPDATE students SET name = ?, age = ?, address = ?, contact = ?, room_no = ? WHERE student_id = ?',
      [name, age, address, contact, room_no, req.params.id]
    );
    res.redirect('/student');
  } catch (err) {
    console.error('❌ Error updating student:', err);
    res.status(500).send('Server error');
  }
});

// ❌ DELETE: Delete student
router.get('/delete/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query('DELETE FROM students WHERE student_id = ?', [req.params.id]);
    res.redirect('/student');
  } catch (err) {
    console.error('❌ Error deleting student:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
