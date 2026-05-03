const express = require('express');
const router = express.Router();
const { database: db } = require('../../database');

// READ - Student List
router.get('/', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM user WHERE type = ?', ['student']);
        res.render('student_pages/students', {
            title: 'Student Management System',
            content: 'Manage and view details of the students.',
            students: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// CREATE - Show Add Form
router.get('/add', (req, res) => {
    renderFormPage(res);
});

// CREATE - Handle Add Student
router.post('/add', async (req, res) => {
    const { name, studentNo, email, phone } = req.body;
    const inputValues = { name, studentNo, email, phone };

    if (!name || name.trim() === '')
        return renderFormPage(res,
            '⚠️ Name is required. Please enter the student\'s full name.',
            null, inputValues);

    if (!studentNo || !/^[A-Za-z0-9]+$/.test(studentNo))
        return renderFormPage(res,
            '⚠️ Student number is invalid. It must contain only letters and numbers (e.g. STD01234 or 2024001) and cannot be empty.',
            null, inputValues);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return renderFormPage(res,
            '⚠️ Email address is invalid. Please enter a valid email (e.g. name@example.com).',
            null, inputValues);

    if (!phone || !/^[\d\s\-\+\(\)]+$/.test(phone))
        return renderFormPage(res,
            '⚠️ Phone number is invalid. It must contain numbers and may include +, -, or spaces (e.g. 0128330631 or +60-12-833-0631) and cannot be empty.',
            null, inputValues);

    try {
        const [existingStudentNo] = await db.query(
            'SELECT id, name FROM user WHERE student_no = ?', [studentNo]
        );
        if (existingStudentNo.length > 0)
            return renderFormPage(res,
                `⚠️ Student number "${studentNo}" is already used by "${existingStudentNo[0].name}". Please use a different student number.`,
                null, inputValues);

        const [existingEmail] = await db.query(
            'SELECT id, name FROM user WHERE email = ?', [email]
        );
        if (existingEmail.length > 0)
            return renderFormPage(res,
                `⚠️ Email "${email}" is already used by "${existingEmail[0].name}". Please use a different email address.`,
                null, inputValues);

        const [existingPhone] = await db.query(
            'SELECT id, name FROM user WHERE phone = ?', [phone]
        );
        if (existingPhone.length > 0)
            return renderFormPage(res,
                `⚠️ Phone number "${phone}" is already used by "${existingPhone[0].name}". Please use a different phone number.`,
                null, inputValues);

        await db.query(
            'INSERT INTO user (name, student_no, email, phone, type) VALUES (?, ?, ?, ?, ?)',
            [name, studentNo, email, phone, 'student']
        );
        res.redirect('/students');

    } catch (err) {
        console.error(err);
        renderFormPage(res,
            '⚠️ Something went wrong while saving. Please try again.',
            null, inputValues);
    }
});

// UPDATE - Show Edit Form
router.get('/update/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM user WHERE id = ? AND type = ?', [req.params.id, 'student']);
        if (rows.length === 0) return res.status(404).send('Student not found');
        renderFormPage(res, null, rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database query failed');
    }
});

// UPDATE - Handle Update Student
router.put('/update/:id', async (req, res) => {
    const { name, studentNo, email, phone } = req.body;
    const currentId = req.params.id;

    let student;
    try {
        const [rows] = await db.query('SELECT * FROM user WHERE id = ? AND type = ?', [currentId, 'student']);
        if (rows.length === 0) return res.status(404).send('Student not found');
        student = rows[0];
    } catch (err) {
        console.error(err);
        return res.status(500).send('Database error');
    }

    const inputValues = { name, studentNo, email, phone };

    if (!name || name.trim() === '')
        return renderFormPage(res,
            '⚠️ Name is required. Please enter the student\'s full name.',
            student, inputValues);

    if (!studentNo || !/^[A-Za-z0-9]+$/.test(studentNo))
        return renderFormPage(res,
            '⚠️ Student number is invalid. It must contain only letters and numbers (e.g. STD01234 or 2024001) and cannot be empty.',
            student, inputValues);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return renderFormPage(res,
            '⚠️ Email address is invalid. Please enter a valid email (e.g. name@example.com).',
            student, inputValues);

    if (!phone || !/^[\d\s\-\+\(\)]+$/.test(phone))
        return renderFormPage(res,
            '⚠️ Phone number is invalid. It must contain numbers and may include +, -, or spaces (e.g. 0128330631 or +60-12-833-0631) and cannot be empty.',
            student, inputValues);

    try {
        const [existingStudentNo] = await db.query(
            'SELECT id, name FROM user WHERE student_no = ? AND id != ?', [studentNo, currentId]
        );
        if (existingStudentNo.length > 0)
            return renderFormPage(res,
                `⚠️ Student number "${studentNo}" is already used by "${existingStudentNo[0].name}". Please use a different student number.`,
                student, inputValues);

        const [existingEmail] = await db.query(
            'SELECT id, name FROM user WHERE email = ? AND id != ?', [email, currentId]
        );
        if (existingEmail.length > 0)
            return renderFormPage(res,
                `⚠️ Email "${email}" is already used by "${existingEmail[0].name}". Please use a different email address.`,
                student, inputValues);

        const [existingPhone] = await db.query(
            'SELECT id, name FROM user WHERE phone = ? AND id != ?', [phone, currentId]
        );
        if (existingPhone.length > 0)
            return renderFormPage(res,
                `⚠️ Phone number "${phone}" is already used by "${existingPhone[0].name}". Please use a different phone number.`,
                student, inputValues);

        const [result] = await db.query(
            'UPDATE user SET name = ?, student_no = ?, email = ?, phone = ? WHERE id = ?',
            [name, studentNo, email, phone, currentId]
        );
        if (result.affectedRows === 0) return res.status(404).send('Student not found');
        res.redirect('/students');

    } catch (err) {
        console.error(err);
        renderFormPage(res,
            '⚠️ Something went wrong while updating. Please try again.',
            student, inputValues);
    }
});

// DELETE - Handle Delete Student
router.delete('/delete/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM user WHERE id = ? AND type = ?', [req.params.id, 'student']);
        if (result.affectedRows === 0) return res.status(404).send('Student not found');
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error. Failed to delete student.');
    }
});

// READ - Student Details
router.get('/:id', async (req, res) => {
    try {
        const [result] = await db.query('SELECT * FROM user WHERE id = ? AND type = ?', [req.params.id, 'student']);
        const student = result[0];
        if (!student) return res.status(404).send('Student not found');
        res.render('student_pages/student_details', {
            title: 'Student Details',
            content: 'View detailed information about this student.',
            student
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

// ─── HELPER ────────────────────────────────────────────────────────
function renderFormPage(res, error = null, student = null, inputValues = null) {
    const isUpdate = !!student;

    const values = inputValues ? {
        name:       inputValues.name,
        student_no: inputValues.studentNo,
        email:      inputValues.email,
        phone:      inputValues.phone
    } : student;

    res.render('student_pages/student_form', {
        title: isUpdate ? 'Update Student' : 'Add New Student',
        content: isUpdate
            ? `Update the details of ${student.name}.`
            : 'Fill in the details to add a new student.',
        error,
        student,
        values,
        formAction: isUpdate
            ? `/students/update/${student.id}?_method=PUT`
            : '/students/add'
    });
}

module.exports = router;