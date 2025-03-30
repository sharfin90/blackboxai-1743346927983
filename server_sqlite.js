const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tech_edu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create users table if not exists
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('MySQL table created/verified');
  } catch (err) {
    console.error('Error setting up MySQL:', err);
  }
})();

// Signup Endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
        db.run(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [fullName, email, hashedPassword],
      function(err) {
        if (err) throw err;
        const userId = this.lastID;
        const token = jwt.sign({ userId }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
        res.status(201).json({ token });
      }
    );

    
    const token = jwt.sign({ userId: result.insertId }, 'YOUR_SECRET_KEY', { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    
        db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err, user) => {
        if (err) throw err;
        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id }, 'YOUR_SECRET_KEY', { 
      expiresIn: remember ? '7d' : '1h' 
    });
    
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`MySQL server running on port ${PORT}`));