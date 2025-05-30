const mysql = require('mysql2/promise');
const sendFeeReminderEmail = require('./sendReminder');
const emails = require('./emails.json');  // Load JSON emails

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hostel_management',
  port: 3305
};

async function sendBulkReminders() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Corrected SQL: Join fees with students to get student name, filter by unpaid status
    const [rows] = await connection.execute(`
      SELECT s.name AS student_name, f.amount AS pending_amount, f.due_date 
      FROM fees f
      JOIN students s ON f.student_id = s.student_id
      WHERE f.status = 'Unpaid'
    `);

    if (rows.length === 0) {
      console.log('No students with pending fees.');
      return;
    }

    for (const student of rows) {
      const { student_name, pending_amount, due_date } = student;
      const studentEmail = emails[student_name];

      if (!studentEmail) {
        console.log(`⚠️ Email not found for ${student_name}, skipping.`);
        continue;
      }

      await sendFeeReminderEmail(studentEmail, student_name, pending_amount, due_date);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) await connection.end();
  }
}

module.exports = sendBulkReminders;
