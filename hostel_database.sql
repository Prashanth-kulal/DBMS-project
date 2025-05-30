CREATE DATABASE hostel_management;
drop database hostel_management;
USE hostel_management;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
ALTER TABLE users ADD COLUMN role ENUM('admin', 'student') NOT NULL;

-- Admin user
INSERT INTO users (username, password, role) VALUES ('admin1', 'admin123', 'admin');

-- Student user
INSERT INTO users (username, password, role) VALUES ('john_doe', 'student123', 'student');

-- Insert a demo user (password: 1234)
INSERT INTO users (username, password) VALUES ('admin', '1234');

CREATE TABLE students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  address VARCHAR(255),
  contact VARCHAR(20),
  room_no VARCHAR(10)
); 
ALTER TABLE students AUTO_INCREMENT = 1;

select * from students;

CREATE TABLE rooms (
  room_no VARCHAR(10) PRIMARY KEY,
  capacity INT,
  occupancy INT,
  type VARCHAR(50) -- e.g., Single, Double, Suite
);

select * from rooms;

CREATE TABLE fees (
    fees_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mess_fees DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

select * from fees;

CREATE TABLE warden (
  warden_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  contact VARCHAR(15) NOT NULL
);

select * from warden;

CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100),
  comments TEXT,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from feedback;

SELECT s.name AS student_name, f.amount AS pending_amount, f.due_date
FROM fees f
JOIN students s ON f.student_id = s.student_id
WHERE f.status = 'Unpaid';
