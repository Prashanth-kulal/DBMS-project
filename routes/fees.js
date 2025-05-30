const express = require('express');
const router = express.Router();

// View all fees
router.get('/', async (req, res) => {
    const db = req.app.locals.pool;
    try {
        const [result] = await db.execute(`
            SELECT fees.*, students.name 
            FROM fees 
            JOIN students ON fees.student_id = students.student_id
        `);
        res.render('fees/index', { fees: result });
    } catch (err) {
        console.error('❌ Error fetching fees:', err);
        res.status(500).send('Database error');
    }
});

// New fee form
router.get('/new', async (req, res) => {
    const db = req.app.locals.pool;
    try {
        const [students] = await db.execute("SELECT * FROM students");
        res.render('fees/new', { students });
    } catch (err) {
        console.error('❌ Error loading students:', err);
        res.status(500).send('Database error');
    }
});

// Create fee
router.post('/create', async (req, res) => {
    const { student_id, amount, mess_fees, due_date, status } = req.body;
    const db = req.app.locals.pool;
    try {
        await db.execute(
            "INSERT INTO fees (student_id, amount, mess_fees, due_date, status) VALUES (?, ?, ?, ?, ?)",
            [student_id, amount, mess_fees, due_date, status]
        );
        res.redirect('/fees');
    } catch (err) {
        console.error('❌ Error inserting fee:', err);
        res.status(500).send('Database error');
    }
});

// Edit fee
router.get('/edit/:id', async (req, res) => {
    const db = req.app.locals.pool;
    const id = req.params.id;
    try {
        const [fee] = await db.execute("SELECT * FROM fees WHERE fees_id = ?", [id]);
        const [students] = await db.execute("SELECT * FROM students");
        res.render('fees/edit', { fee: fee[0], students });
    } catch (err) {
        console.error('❌ Error editing fee:', err);
        res.status(500).send('Database error');
    }
});

// Update fee
router.post('/update/:id', async (req, res) => {
    const { student_id, amount, mess_fees, due_date, status } = req.body;
    const id = req.params.id;
    const db = req.app.locals.pool;
    try {
        await db.execute(
            `UPDATE fees 
             SET student_id = ?, amount = ?, mess_fees = ?, due_date = ?, status = ? 
             WHERE fees_id = ?`,
            [student_id, amount, mess_fees, due_date, status, id]
        );
        res.redirect('/fees');
    } catch (err) {
        console.error('❌ Error updating fee:', err);
        res.status(500).send('Database error');
    }
});

// Delete fee
router.get('/delete/:id', async (req, res) => {
    const db = req.app.locals.pool;
    const id = req.params.id;
    try {
        await db.execute("DELETE FROM fees WHERE fees_id = ?", [id]);
        res.redirect('/fees');
    } catch (err) {
        console.error('❌ Error deleting fee:', err);
        res.status(500).send('Database error');
    }
});

module.exports = router;
