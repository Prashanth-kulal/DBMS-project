const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const session = require('express-session');
const app = express();

// Import the bulk email reminder sender
const sendBulkReminders = require('./sendBulkReminders');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hostel_management',
  port: 3305
};

// Initialize database connection pool
let pool;
(async function initializeDB() {
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('✅ Connected to MySQL database!');
    app.locals.pool = pool;
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
})();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to protect routes
function ensureLogin(req, res, next) {
  if (!req.session.loggedInUser) {
    console.log('⚠️ Not logged in, redirecting...');
    return res.redirect('/');
  }
  next();
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      const user = rows[0];

      req.session.loggedInUser = user.username;
      req.session.userRole = user.role;

      return req.session.save(err => {
        if (err) {
          console.error('❌ Session save error:', err);
          return res.render('index', { error: 'Session error' });
        }
        if (user.role === 'admin') {
          return res.redirect('/dashboard');
        } else if (user.role === 'student') {
          return res.redirect('/student-dashboard');
        } else {
          return res.render('index', { error: 'Invalid user role' });
        }
      });
    } else {
      res.render('index', { error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    res.render('index', { error: 'Database error' });
  }
});

app.get('/dashboard', ensureLogin, (req, res) => {
  if (req.session.userRole !== 'admin') {
    return res.status(403).send('Access denied.');
  }
  res.render('dashboard', { username: req.session.loggedInUser });
});

app.get('/student-dashboard', ensureLogin, async (req, res) => {
  if (req.session.userRole !== 'student') {
    return res.status(403).send('Access denied.');
  }

  try {
    const [studentRows] = await pool.execute(
      'SELECT * FROM students WHERE name = ?',
      [req.session.loggedInUser]
    );

    if (studentRows.length === 0) {
      return res.render('student-dashboard', { student: null, username: req.session.loggedInUser });
    }

    res.render('student-dashboard', { student: studentRows[0], username: req.session.loggedInUser });
  } catch (err) {
    console.error('❌ Error fetching student data:', err);
    res.status(500).send('Server error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// 🏠 Room Management Routes
const roomRoutes = require('./routes/room');
app.use('/room', ensureLogin, roomRoutes);

// 🎓 Student Management Routes
const studentRoutes = require('./routes/student');
app.use('/student', ensureLogin, studentRoutes);

// 💸 Fees Management Routes
const feesRoutes = require('./routes/fees');
app.use('/fees', ensureLogin, feesRoutes);

// 🧑‍🏫 Warden Management Routes
const wardenRoutes = require('./routes/warden');
app.use('/warden', ensureLogin, wardenRoutes);

// 📊 Report Section Routes ✅
const reportRoutes = express.Router();

reportRoutes.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;

    const [students] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [rooms] = await pool.query('SELECT COUNT(*) AS total FROM rooms');
    const [occupied] = await pool.query('SELECT COUNT(*) AS total FROM rooms WHERE occupancy > 0');
    const [unpaid] = await pool.query("SELECT COUNT(*) AS total FROM fees WHERE status = 'unpaid'");
    const [paidTotal] = await pool.query("SELECT SUM(amount) AS total FROM fees WHERE status = 'paid'");
    const [feedbacks] = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");

    res.render('report', {
      totalStudents: students[0].total,
      totalRooms: rooms[0].total,
      occupiedRooms: occupied[0].total,
      unpaidFees: unpaid[0].total,
      paidFeesTotal: Number(paidTotal[0].total) || 0,
      feedbacks: feedbacks
    });
  } catch (err) {
    console.error('❌ Report generation error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/report', ensureLogin, reportRoutes);

// ✅ UPDATED: Feedback route (no redirect, anonymous name, send message)
app.post('/feedback', ensureLogin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { comments, rating } = req.body;

    if (!comments || !rating) {
      return res.status(400).send('❌ Comments and rating are required.');
    }

    const sql = `INSERT INTO feedback (username, comments, rating, created_at) VALUES (?, ?, ?, NOW())`;
    await pool.execute(sql, ['anonymous', comments, rating]); // Store as anonymous

    res.send('✅ Feedback submitted successfully!');
  } catch (err) {
    console.error('❌ Error submitting feedback:', err);
    res.status(500).send('❌ Server error submitting feedback.');
  }
});

// 🧪 Debug: Check current session
app.get('/check-session', (req, res) => {
  res.send(`Session User: ${req.session.loggedInUser || 'Not logged in'} | Role: ${req.session.userRole || 'None'}`);
});

// --- NEW ROUTE: Send bulk fee reminders ---
app.get('/send-bulk-reminders', ensureLogin, async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    await sendBulkReminders(pool);
    res.send('✅ Bulk fee reminders sent!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send bulk reminders');
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).send(`404 Not Found: ${req.originalUrl}`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
