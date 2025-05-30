const express = require('express');
const router = express.Router();

// View all wardens
router.get('/', async (req, res) => {
    const db = req.app.locals.pool;
    try {
        const [result] = await db.execute("SELECT * FROM warden");
        res.render('warden/index', { wardens: result });
    } catch (err) {
        console.error('❌ Error fetching wardens:', err);
        res.status(500).send('Database error');
    }
});

// New warden form
router.get('/new', (req, res) => {
    res.render('warden/new');
});

// Create new warden
router.post('/create', async (req, res) => {
    const { name, contact } = req.body;
    const db = req.app.locals.pool;
    try {
        await db.execute("INSERT INTO warden (name, contact) VALUES (?, ?)", [name, contact]);
        res.redirect('/warden');
    } catch (err) {
        console.error('❌ Error creating warden:', err);
        res.status(500).send('Database error');
    }
});

// Edit form
router.get('/edit/:id', async (req, res) => {
    const db = req.app.locals.pool;
    const id = req.params.id;
    try {
        const [warden] = await db.execute("SELECT * FROM warden WHERE warden_id = ?", [id]);
        res.render('warden/edit', { warden: warden[0] });
    } catch (err) {
        console.error('❌ Error editing warden:', err);
        res.status(500).send('Database error');
    }
});

// Update warden
router.post('/update/:id', async (req, res) => {
    const db = req.app.locals.pool;
    const id = req.params.id;
    const { name, contact } = req.body;
    try {
        await db.execute(
            "UPDATE warden SET name = ?, contact = ? WHERE warden_id = ?",
            [name, contact, id]
        );
        res.redirect('/warden');
    } catch (err) {
        console.error('❌ Error updating warden:', err);
        res.status(500).send('Database error');
    }
});

// Delete warden
router.get('/delete/:id', async (req, res) => {
    const db = req.app.locals.pool;
    const id = req.params.id;
    try {
        await db.execute("DELETE FROM warden WHERE warden_id = ?", [id]);
        res.redirect('/warden');
    } catch (err) {
        console.error('❌ Error deleting warden:', err);
        res.status(500).send('Database error');
    }
});

module.exports = router;
