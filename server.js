require('dotenv').config();

const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const cors = require('cors');

const { testDatabaseConnection } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// CORS CONFIGURATION
// ======================================================
// This allows your backend to accept requests from:
// - Express itself: http://localhost:3000
// - Angular frontend later: http://localhost:4200
// - Postman will also continue working normally

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4200'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ======================================================
// VIEW ENGINE SETUP
// ======================================================

app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======================================================
// GLOBAL MIDDLEWARE
// ======================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ======================================================
// STATIC FILES
// ======================================================

// Serve files inside public folder
// Example:
// public/index.html
// public/css/header.css
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded image files
// Physical folder:
// files/images
//
// Browser/API URL format:
// http://localhost:3000/api/files/images/filename.jpg
app.use(
  '/api/files/images',
  express.static(path.join(__dirname, 'files', 'images'))
);

// Optional legacy support
// This allows old database image paths like:
// /files/images/Dogs_love.jpg
//
// You may keep this temporarily while cleaning old data.
app.use(
  '/files/images',
  express.static(path.join(__dirname, 'files', 'images'))
);

// ======================================================
// WEB ROUTES
// ======================================================

const blogRoutes = require('./routes/blog/blog_routes');
const contactRoutes = require('./routes/contacts/contacts_routes');
const studentRoutes = require('./routes/student/student_routes');

app.use('/blogs', blogRoutes);
app.use('/contacts', contactRoutes);
app.use('/students', studentRoutes);

// ======================================================
// API ROUTES
// ======================================================

const reportApiRoutes = require('./routes/api/report_api_routes');
const authApiRoutes = require('./routes/api/auth_api_routes');

app.use('/api/reports', reportApiRoutes);
app.use('/api/auth', authApiRoutes);

// ======================================================
// HOME ROUTE
// ======================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================================================
// 404 ROUTE HANDLER
// ======================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: err.message
  });
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});