const express = require('express');
const router = express.Router();
const db = require('../../backup/old_database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();   // Make sure process.env.JWT_SECRET is loaded

// ─── MULTER CONFIGURATION ────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'files/images');
  },
  filename: function (req, file, callback) {
    const uniqueName = 'image-' + Date.now() + path.extname(file.originalname);
    callback(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// ─── HELPER: Success Response ────────────────────────────────────
function successResponse(res, code = 200, message = 'Successful.', data = null) {
  return res.status(code).json({
    success: true,
    message,
    data,
  });
}

// ─── HELPER: Error Response ──────────────────────────────────────
function errorResponse(res, code = 500, message = 'Something went wrong.', error = null, errors = null) {
  return res.status(code).json({
    success: false,
    message,
    error,
    errors,
  });
}

// ─── Helper: resolve image path from upload or text field ────────
function resolveImagePath(req, errors) {
  if (req.file) {
    return `/files/images/${req.file.filename}`;
  }
  const textPath = req.body.image_path;
  if (textPath && textPath.trim() !== '') {
    const cleaned = textPath.trim();
    if (!cleaned.startsWith('/files/images/')) {
      errors.push('image_path must start with /files/images/');
      return null;
    }
    const fullPath = path.join(__dirname, '..', '..', cleaned);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Image file does not exist: ${cleaned}`);
      return null;
    }
    return cleaned;
  }
  return null;
}

// ─── JWT Middleware ──────────────────────────────────────────────
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];   // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 401, 'Access denied. No token provided.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return errorResponse(res, 403, 'Invalid or expired token.');
    }
    req.user = user;   // Attach the decoded user (id, email) to the request
    next();
  });
}

// ─── GET /api/reports – All reports (no user join) ───────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports ORDER BY id DESC');
    successResponse(res, 200, 'Reports retrieved successfully.', rows);
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Database error. Failed to fetch reports.', err.message);
  }
});

// ─── GET /api/reports/:id – Single report (no user join) ─────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }
    successResponse(res, 200, 'Report details retrieved successfully.', rows[0]);
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Database error.', err.message);
  }
});

// ─── POST /api/reports/add – Create a report (PROTECTED) ─────────
router.post('/add', verifyToken, upload.single('image'), async (req, res) => {
  const { title, date, category, user_id } = req.body;
  const errors = [];

  const imagePath = resolveImagePath(req, errors);

  // Validation
  if (!title || title.trim() === '') {
    errors.push('Title cannot be empty.');
  }
  if (!date || date.trim() === '') {
    errors.push('Date cannot be empty.');
  } else if (isNaN(Date.parse(date))) {
    errors.push('Date is not a valid datetime.');
  }
  if (!category || category.trim() === '') {
    errors.push('Category cannot be empty.');
  }
  if (!user_id || user_id.toString().trim() === '') {
    errors.push('User ID cannot be empty.');
  } else {
    try {
      const [userRows] = await db.query('SELECT id FROM user WHERE id = ?', [user_id]);
      if (userRows.length === 0) {
        errors.push(`User with ID ${user_id} does not exist.`);
      }
    } catch (err) {
      console.error(err);
      errors.push('Could not verify user ID.');
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed.', null, errors);
  }

  try {
    let query = 'INSERT INTO reports (title, date, category, user_id';
    let values = 'VALUES (?, ?, ?, ?';
    const params = [title, date, category, user_id];

    if (imagePath) {
      query += ', image_path';
      values += ', ?';
      params.push(imagePath);
    }

    query += ') ' + values + ')';
    const [result] = await db.query(query, params);

    const data = {
      id: result.insertId,
      title,
      date,
      category,
      image_path: imagePath || null,
      user_id,
    };

    successResponse(res, 201, 'Report added successfully.', data);
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Database error. Failed to add report.', err.message);
  }
});

// ─── PUT /api/reports/update/:id – Update a report (PROTECTED) ───
router.put('/update/:id', verifyToken, upload.single('image'), async (req, res) => {
  const { title, date, category } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title cannot be empty.');
  }
  if (!date || date.trim() === '') {
    errors.push('Date cannot be empty.');
  } else if (isNaN(Date.parse(date))) {
    errors.push('Date is not a valid datetime.');
  }
  if (!category || category.trim() === '') {
    errors.push('Category cannot be empty.');
  }

  if (errors.length > 0) {
    return errorResponse(res, 400, 'Validation failed.', null, errors);
  }

  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }
    const oldImagePath = rows[0].image_path;

    const newImagePath = resolveImagePath(req, errors);
    if (errors.length > 0) {
      return errorResponse(res, 400, 'Validation failed.', null, errors);
    }

    let query = 'UPDATE reports SET title = ?, date = ?, category = ?';
    const params = [title, date, category];

    if (newImagePath !== null) {
      query += ', image_path = ?';
      params.push(newImagePath);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }

    // If a new image was provided and it's different, delete the old one
    if (newImagePath && oldImagePath && newImagePath !== oldImagePath) {
      const oldFullPath = path.join(__dirname, '..', '..', oldImagePath);
      fs.unlink(oldFullPath, (err) => {
        if (err) console.warn('Could not delete old image:', oldFullPath);
      });
    }

    successResponse(res, 200, 'Report updated successfully.');
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Database error. Failed to update report.', err.message);
  }
});

// ─── DELETE /api/reports/delete/:id – Delete a report (PROTECTED)─
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT image_path FROM reports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }

    await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);

    const imagePath = rows[0].image_path;
    if (imagePath) {
      const fullPath = path.join(__dirname, '..', '..', imagePath);
      fs.unlink(fullPath, (err) => {
        if (err) console.warn('Image file not found or already deleted:', fullPath);
      });
    }

    successResponse(res, 200, 'Report deleted successfully.', { id: req.params.id });
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, 'Database error. Failed to delete report.', err.message);
  }
});

module.exports = router;