require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.send('Hello Express!');
});

app.get('/about', (req, res) => {
    res.send('You are viewing about us page');
});

app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    res.send('Product id: ' + id);
});

app.get('/search', (req, res) => {
    const { keyword, page } = req.query;
    res.send('Search: ' + keyword + ' (page: ' + page + ')');
});

const blogRoutes = require('../routes/blog/blog_routes');
app.use('/blogs', blogRoutes);

const contactRoutes = require('../routes/contacts/contacts_routes');
app.use('/contacts', contactRoutes);

const studentRoutes = require('../routes/student/student_routes');
app.use('/students', studentRoutes);

// Report API Route
const reportApiRoutes = require('../routes/api/report_api_routes');
app.use('/api/reports', reportApiRoutes);

// Serve uploaded images statically
app.use('/api/files/images', express.static(path.join(__dirname, 'files/images')));

// Auth API Route
const authApiRoutes = require('../routes/api/auth_api_routes');
app.use('/api/auth', authApiRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));