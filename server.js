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
// Allows backend requests from:
// - Express web pages: http://localhost:3000
// - Angular frontend: http://localhost:4200
// - Postman / Thunder Client
// - Railway frontend/backend later if configured

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4200',
    'https://angular-mymahir.web.app',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded image files through API-style URL
// Example:
// http://localhost:3000/api/files/images/Dogs_love.jpg
app.use(
  '/api/files/images',
  express.static(path.join(__dirname, 'files', 'images'))
);

// Optional legacy support for old image paths
// Example:
// http://localhost:3000/files/images/Dogs_love.jpg
app.use(
  '/files/images',
  express.static(path.join(__dirname, 'files', 'images'))
);

// ======================================================
// WEB ROUTES - SERVER RENDERED PAGES
// ======================================================
// These are for EJS/browser pages handled by Express.

const blogRoutes = require('./routes/blog/blog_routes');
const contactRoutes = require('./routes/contacts/contacts_routes');
const studentRoutes = require('./routes/student/student_routes');

app.use('/blogs', blogRoutes);
app.use('/contacts', contactRoutes);
app.use('/students', studentRoutes);

// ======================================================
// API ROUTES - USED BY ANGULAR FRONTEND
// ======================================================
// These return JSON data for Angular HttpClient.

const reportApiRoutes = require('./routes/api/report_api_routes');
const authApiRoutes = require('./routes/api/auth_api_routes');
const studentApiRoutes = require('./routes/api/student_api_routes');

app.use('/api/reports', reportApiRoutes);
app.use('/api/auth', authApiRoutes);
app.use('/api/students', studentApiRoutes);

// ======================================================
// API HEALTH CHECK
// ======================================================

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is running.',
    endpoints: {
      reports: '/api/reports',
      students: '/api/students',
      auth: '/api/auth/login',
    },
  });
});

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
    message: 'Route not found.',
    path: req.originalUrl,
  });
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: err.message,
  });
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await testDatabaseConnection();
});