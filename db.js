const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',     // Use IPv4 explicitly
  user: 'root',          // Your MySQL username
  password: 'root',  // Your MySQL password
  database: 'hostel_management',   // Your database name
  port: 3305             // <-- Update port number here
});

connection.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
  } else {
    console.log('MySQL connected successfully.');
  }
});


