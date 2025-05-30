const nodemailer = require('nodemailer');

async function sendFeeReminderEmail(studentEmail, studentName, dueAmount, dueDate) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'bhaskarakulal649@gmail.com',         // Your Gmail address
      pass: 'wzet qjyc vtko akdp'            // Your Gmail app password from Step 1
    }
  });

  const mailOptions = {
    from: '"Hostel Management" <bhaskarakulal649@gmail.com>',
    to: studentEmail,
    subject: '⏰ Hostel Fee Payment Reminder',
    html: `
      <h3>Hi ${studentName},</h3>
      <p>This is a reminder that your hostel fee of <b>₹${dueAmount}</b> is due on <b>${dueDate}</b>.</p>
      <p>Please pay it at the earliest.</p>
      <p>Thank you,<br/>Hostel Management Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${studentEmail}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
}

module.exports = sendFeeReminderEmail;
