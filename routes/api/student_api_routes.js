const express = require('express');
const router = express.Router();

const { database } = require('../../database');

// ======================================================
// GET ALL STUDENTS
// URL: GET /api/students
// ======================================================

router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        name,
        student_no,
        email,
        phone,
        type
      FROM \`user\`
      WHERE type = ?
      ORDER BY id ASC
    `;

    const [rows] = await database.query(sql, ['student']);

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('GET STUDENTS ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students.',
      error: err.message,
    });
  }
});

// ======================================================
// GET SINGLE STUDENT
// URL: GET /api/students/:id
// ======================================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        id,
        name,
        student_no,
        email,
        phone,
        type
      FROM \`user\`
      WHERE id = ?
      AND type = ?
      LIMIT 1
    `;

    const [rows] = await database.query(sql, [id, 'student']);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('GET SINGLE STUDENT ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student.',
      error: err.message,
    });
  }
});

// ======================================================
// ADD STUDENT
// URL: POST /api/students/add
// ======================================================

router.post('/add', async (req, res) => {
  try {
    const { name, student_no, email, phone } = req.body;

    if (!name || !student_no || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, student number, and email are required.',
      });
    }

    const checkSql = `
      SELECT id
      FROM \`user\`
      WHERE student_no = ?
      OR email = ?
      LIMIT 1
    `;

    const [existingRows] = await database.query(checkSql, [student_no, email]);

    if (existingRows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Student number or email already exists.',
      });
    }

    const insertSql = `
      INSERT INTO \`user\`
        (name, student_no, email, phone, hash_password, type)
      VALUES
        (?, ?, ?, ?, NULL, ?)
    `;

    const [result] = await database.query(insertSql, [
      name,
      student_no,
      email,
      phone || null,
      'student',
    ]);

    res.status(201).json({
      success: true,
      message: 'Student added successfully.',
      data: {
        id: result.insertId,
        name,
        student_no,
        email,
        phone: phone || null,
        type: 'student',
      },
    });
  } catch (err) {
    console.error('ADD STUDENT ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to add student.',
      error: err.message,
    });
  }
});

// ======================================================
// UPDATE STUDENT
// URL: PUT /api/students/:id
// ======================================================

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, student_no, email, phone } = req.body;

    if (!name || !student_no || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, student number, and email are required.',
      });
    }

    const updateSql = `
      UPDATE \`user\`
      SET
        name = ?,
        student_no = ?,
        email = ?,
        phone = ?
      WHERE id = ?
      AND type = ?
    `;

    const [result] = await database.query(updateSql, [
      name,
      student_no,
      email,
      phone || null,
      id,
      'student',
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully.',
      data: {
        id: Number(id),
        name,
        student_no,
        email,
        phone: phone || null,
        type: 'student',
      },
    });
  } catch (err) {
    console.error('UPDATE STUDENT ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to update student.',
      error: err.message,
    });
  }
});

// ======================================================
// DELETE STUDENT
// URL: DELETE /api/students/:id
// ======================================================

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSql = `
      DELETE FROM \`user\`
      WHERE id = ?
      AND type = ?
    `;

    const [result] = await database.query(deleteSql, [id, 'student']);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully.',
    });
  } catch (err) {
    console.error('DELETE STUDENT ERROR:', err);

    res.status(500).json({
      success: false,
      message: 'Failed to delete student.',
      error: err.message,
    });
  }
});

module.exports = router;