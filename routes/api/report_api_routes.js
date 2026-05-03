const express = require('express');
const router = express.Router();

const { database: db } = require('../../database');
const verifyToken = require('../../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ======================================================
// IMAGE UPLOAD CONFIGURATION
// ======================================================

const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', 'files', 'images');

// Make sure files/images exists
if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
  fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, IMAGE_UPLOAD_DIR);
  },

  filename: function (req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();

    const safeName = originalName || 'image';
    const uniqueName = `${safeName}-${Date.now()}${ext}`;

    callback(null, uniqueName);
  }
});

const fileFilter = function (req, file, callback) {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new Error('Only image files are allowed.'), false);
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

function uploadSingleImage(req, res, next) {
  const uploader = upload.single('image');

  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return errorResponse(res, 400, 'File upload error.', err.message);
    }

    if (err) {
      return errorResponse(res, 400, 'Invalid file upload.', err.message);
    }

    next();
  });
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function successResponse(
  res,
  code = 200,
  message = 'Successful.',
  data = null
) {
  return res.status(code).json({
    success: true,
    message,
    data
  });
}

function errorResponse(
  res,
  code = 500,
  message = 'Something went wrong.',
  error = null,
  errors = null
) {
  return res.status(code).json({
    success: false,
    message,
    error,
    errors
  });
}

function getPublicImagePath(file) {
  if (!file) return null;

  return `/api/files/images/${file.filename}`;
}

function getFullImageFilePath(imagePath) {
  if (!imagePath) return null;

  const filename = path.basename(imagePath);
  return path.join(IMAGE_UPLOAD_DIR, filename);
}

function removeImageFile(imagePath) {
  const fullPath = getFullImageFilePath(imagePath);

  if (!fullPath) return;

  fs.unlink(fullPath, function (err) {
    if (err) {
      console.warn('Image file not found or already deleted:', fullPath);
    }
  });
}

function validateReportInput(body) {
  const title = body.title ? String(body.title).trim() : '';
  const date = body.date ? String(body.date).trim() : '';
  const category = body.category ? String(body.category).trim() : '';
  const user_id = body.user_id ? String(body.user_id).trim() : '';

  const errors = [];

  if (!title) {
    errors.push('Title cannot be empty.');
  }

  if (!date) {
    errors.push('Date cannot be empty.');
  }

  if (!category) {
    errors.push('Category cannot be empty.');
  }

  if (!user_id) {
    errors.push('User cannot be empty.');
  }

  if (user_id && !/^\d+$/.test(user_id)) {
    errors.push('User ID must contain numbers only.');
  }

  return {
    values: {
      title,
      date,
      category,
      user_id
    },
    errors
  };
}

async function checkUserExists(userId) {
  const [rows] = await db.query(
    'SELECT id FROM `user` WHERE id = ? LIMIT 1',
    [userId]
  );

  return rows.length > 0;
}

// ======================================================
// GET - GET ALL REPORTS
// Public route
// URL: GET /api/reports
// ======================================================

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        report.id,
        report.title,
        report.date,
        report.category,
        report.image_path,
        report.user_id,
        user.name AS user_name,
        user.email AS user_email
      FROM reports AS report
      LEFT JOIN \`user\` AS user
        ON report.user_id = user.id
      ORDER BY report.id DESC
      `
    );

    return successResponse(
      res,
      200,
      'Reports retrieved successfully.',
      rows
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      'Database error. Reports retrieval failed.',
      err.message
    );
  }
});

// ======================================================
// GET - GET REPORT DETAILS BY ID
// Public route
// URL: GET /api/reports/:id
// ======================================================

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT
        report.id AS report_id,
        report.title,
        report.date,
        report.category,
        report.image_path,
        report.user_id,
        user.id AS user_id,
        user.name AS user_name,
        user.email AS user_email
      FROM reports AS report
      LEFT JOIN \`user\` AS user
        ON report.user_id = user.id
      WHERE report.id = ?
      LIMIT 1
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }

    const row = rows[0];

    const report = {
      id: row.report_id,
      title: row.title,
      date: row.date,
      category: row.category,
      image_path: row.image_path,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      }
    };

    return successResponse(
      res,
      200,
      'Report details retrieved successfully.',
      report
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      'Database error. Report details retrieval failed.',
      err.message
    );
  }
});

// ======================================================
// POST - ADD REPORT
// Protected route
// URL: POST /api/reports/add
//
// Postman Body type:
// form-data
//
// Fields:
// title      Text
// date       Text, example: 2026-04-28
// category   Text
// user_id    Text, example: 15
// image      File
// ======================================================

router.post('/add', verifyToken, uploadSingleImage, async (req, res) => {
  const imagePath = getPublicImagePath(req.file);

  const { values, errors } = validateReportInput(req.body);
  const { title, date, category, user_id } = values;

  if (errors.length > 0) {
    if (imagePath) {
      removeImageFile(imagePath);
    }

    return errorResponse(
      res,
      400,
      'Validation failed.',
      null,
      errors
    );
  }

  try {
    const userExists = await checkUserExists(user_id);

    if (!userExists) {
      if (imagePath) {
        removeImageFile(imagePath);
      }

      return errorResponse(
        res,
        404,
        'User not found. Please provide a valid user_id.'
      );
    }

    const [result] = await db.query(
      `
      INSERT INTO reports
        (title, date, category, image_path, user_id)
      VALUES
        (?, ?, ?, ?, ?)
      `,
      [title, date, category, imagePath, user_id]
    );

    const data = {
      id: result.insertId,
      title,
      date,
      category,
      image_path: imagePath,
      user_id
    };

    return successResponse(
      res,
      201,
      'Report added successfully.',
      data
    );
  } catch (err) {
    if (imagePath) {
      removeImageFile(imagePath);
    }

    return errorResponse(
      res,
      500,
      'Database error. Failed to add report.',
      err.message
    );
  }
});

// ======================================================
// PUT - UPDATE REPORT BY ID
// Protected route
// URL: PUT /api/reports/update/:id
//
// Postman Body type:
// form-data
//
// Fields:
// title      Text
// date       Text, example: 2026-04-28
// category   Text
// user_id    Text
// image      File, optional
// ======================================================

router.put('/update/:id', verifyToken, uploadSingleImage, async (req, res) => {
  const newImagePath = getPublicImagePath(req.file);

  const { values, errors } = validateReportInput(req.body);
  const { title, date, category, user_id } = values;

  if (errors.length > 0) {
    if (newImagePath) {
      removeImageFile(newImagePath);
    }

    return errorResponse(
      res,
      400,
      'Validation failed.',
      null,
      errors
    );
  }

  try {
    const [existingRows] = await db.query(
      'SELECT image_path FROM reports WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      if (newImagePath) {
        removeImageFile(newImagePath);
      }

      return errorResponse(res, 404, 'Report not found.');
    }

    const userExists = await checkUserExists(user_id);

    if (!userExists) {
      if (newImagePath) {
        removeImageFile(newImagePath);
      }

      return errorResponse(
        res,
        404,
        'User not found. Please provide a valid user_id.'
      );
    }

    const oldImagePath = existingRows[0].image_path;

    let query = `
      UPDATE reports
      SET title = ?, date = ?, category = ?, user_id = ?
    `;

    const params = [title, date, category, user_id];

    if (newImagePath) {
      query += ', image_path = ?';
      params.push(newImagePath);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      if (newImagePath) {
        removeImageFile(newImagePath);
      }

      return errorResponse(res, 404, 'Report not found.');
    }

    if (newImagePath && oldImagePath) {
      removeImageFile(oldImagePath);
    }

    const data = {
      id: Number(req.params.id),
      title,
      date,
      category,
      image_path: newImagePath || oldImagePath,
      user_id
    };

    return successResponse(
      res,
      200,
      'Report updated successfully.',
      data
    );
  } catch (err) {
    if (newImagePath) {
      removeImageFile(newImagePath);
    }

    return errorResponse(
      res,
      500,
      'Database error. Failed to update report.',
      err.message
    );
  }
});

// ======================================================
// DELETE - DELETE REPORT BY ID
// Protected route
// URL: DELETE /api/reports/delete/:id
// ======================================================

router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT image_path FROM reports WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }

    const imagePath = rows[0].image_path;

    const [result] = await db.query(
      'DELETE FROM reports WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 404, 'Report not found.');
    }

    if (imagePath) {
      removeImageFile(imagePath);
    }

    return successResponse(
      res,
      200,
      'Report deleted successfully.',
      {
        id: Number(req.params.id)
      }
    );
  } catch (err) {
    return errorResponse(
      res,
      500,
      'Database error. Failed to delete report.',
      err.message
    );
  }
});

module.exports = router;