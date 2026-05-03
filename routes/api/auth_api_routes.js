const express = require('express');
const router = express.Router();
const { database: db } = require('../../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const upload = multer(); // for parsing multipart/form-data (even if no file)

// ─── HELPERS (same as your report routes) ────────────────────
function successResponse(res, code = 200, message = 'Successful.', data = null) {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, code = 500, message = 'Something went wrong.', error = null, errors = null) {
  return res.status(code).json({
    success: false,
    message,
    error,
    errors,
  });
}

// ─── POST /api/auth/register ─────────────────────────────────
router.post('/register', upload.none(), async (req, res) => {
  // Multer's .none() parses multipart/form-data without file uploads
  const { name, email, password } = req.body;
  const errors = [];

  // Validation
  if (!name || name.trim() === '') {
    errors.push('Name cannot be empty.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed.', null, errors);
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT id FROM user WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return errorResponse(res, 409, 'Email already registered.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with type 'admin'
    const [result] = await db.query(
      'INSERT INTO user (name, email, hash_password, type) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin']
    );

    const data = {
      id: result.insertId,
      name,
      email,
      type: 'admin',
    };

    successResponse(res, 201, 'User registered successfully.', data);
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Registration failed.', err.message);
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', upload.none(), async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address.');
  }
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed.', null, errors);
  }

  try {
    // Find user by email and type = 'admin'
    const [rows] = await db.query(
      'SELECT * FROM user WHERE email = ? AND type = ?',
      [email, 'admin']
    );
    if (rows.length === 0) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.hash_password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    // Generate JWT (expires in 1 hour)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    successResponse(res, 200, 'Login successful.', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Login failed.', err.message);
  }
});

module.exports = router;