Below is the improved and updated **README.md** file. It retains all technical details while adding clear recognition of the **MyMAHIR Angular Training Workshop 2026 Cohort 2** and **Danish Syazani bin Mohd Zakir** as the main developer.

```markdown
# Blog Contact Form - Express.js Full Stack Training Project

> **Program:** MyMAHIR Angular Training Workshop 2026 – Cohort 2  
> **Main Developer:** Danish Syazani bin Mohd Zakir  
> **Project Type:** Full-stack training project (Express.js, MySQL, REST API)

A full-stack web application built with **Node.js**, **Express.js**, **EJS**, **MySQL**, and **REST API architecture**.  
This project was developed as part of an Express.js full-stack development training module and covers backend routing, server-side rendered pages, MySQL CRUD operations, JWT authentication, image uploads with Multer, Postman API testing, and deployment preparation.

---

## Project Overview

This project combines multiple Express.js learning modules into one complete backend application.

It includes:

- Static page serving with Express
- Blog page routing with EJS
- Contact Manager CRUD using in-memory array data
- Student Management System CRUD using MySQL
- Report REST API with MySQL
- Image upload using Multer
- JWT-based authentication
- Protected API routes
- Postman API testing workflow
- CORS setup for frontend integration
- Deployment-ready environment configuration

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend web framework |
| EJS | Server-side template rendering |
| MySQL | Relational database |
| mysql2 | MySQL connection package |
| Multer | File/image upload handling |
| JSON Web Token | API authentication |
| bcrypt | Password hashing |
| dotenv | Environment variable management |
| method-override | PUT and DELETE support from HTML forms |
| cors | Cross-origin API access |
| nodemon | Development server auto-restart |
| Postman | API testing |

---

## Main Features

### 1. Blog Pages

The blog section demonstrates basic Express routing and EJS rendering.

Features:

- Blog listing page
- Individual blog detail page
- Dynamic route parameters
- EJS template rendering

Routes:

```txt
GET /blogs
GET /blogs/post/:id
```

### 2. Contact Manager

The contact module demonstrates CRUD operations using an in-memory JavaScript array.

Features:

- View all contacts
- Add new contact
- View contact details
- Update contact
- Delete contact
- Form validation
- EJS views
- Method override for PUT and DELETE

Routes:

```txt
GET    /contacts
GET    /contacts/add
POST   /contacts/add
GET    /contacts/:id
GET    /contacts/update/:id
PUT    /contacts/update/:id
DELETE /contacts/delete/:id
```

### 3. Student Management System

The student module demonstrates CRUD operations using MySQL.

Features:

- View all students
- Add new student
- View student details
- Update student
- Delete student
- MySQL database integration
- Input validation
- EJS views

Routes:

```txt
GET    /students
GET    /students/add
POST   /students/add
GET    /students/:id
GET    /students/update/:id
PUT    /students/update/:id
DELETE /students/delete/:id
```

### 4. Report REST API

The report module demonstrates a JSON REST API using Express and MySQL.

Features:

- Get all reports
- Get report details by ID
- Add report
- Update report
- Delete report
- Join reports with user data
- Upload report image using Multer
- Store image path in MySQL
- Return JSON responses
- Protected write operations using JWT

API Routes:

```txt
GET    /api/reports
GET    /api/reports/:id
POST   /api/reports/add
PUT    /api/reports/update/:id
DELETE /api/reports/delete/:id
```

### 5. Authentication API

The authentication module provides user registration and login.

Features:

- Register admin user
- Hash password using bcrypt
- Login with email and password
- Generate JWT token
- Use token to access protected routes

API Routes:

```txt
POST /api/auth/register
POST /api/auth/login
```

### 6. Image Upload

Report images are uploaded using Multer.

Image upload flow:

```text
Postman form-data image upload
        ↓
Multer saves file into files/images
        ↓
Express generates public image URL
        ↓
MySQL stores image_path
        ↓
API returns image_path in JSON response
```

Public image URL format:

```txt
/api/files/images/filename.jpg
```

Example full local URL:

```txt
http://localhost:3000/api/files/images/filename.jpg
```

---

## Project Folder Structure

```text
blog-contact-form/
│
├── files/
│   └── images/
│       └── uploaded images
│
├── middleware/
│   └── auth.js
│
├── public/
│   ├── css/
│   │   ├── contacts.css
│   │   ├── header.css
│   │   ├── student.css
│   │   └── styles.css
│   └── index.html
│
├── routes/
│   ├── api/
│   │   ├── auth_api_routes.js
│   │   └── report_api_routes.js
│   │
│   ├── blog/
│   │   └── blog_routes.js
│   │
│   ├── contacts/
│   │   └── contacts_routes.js
│   │
│   └── student/
│       └── student_routes.js
│
├── views/
│   ├── contact/
│   │   ├── contact_details.ejs
│   │   ├── contact_form.ejs
│   │   └── contacts.ejs
│   │
│   ├── student_pages/
│   │   ├── student_details.ejs
│   │   ├── student_form.ejs
│   │   └── students.ejs
│   │
│   └── blogs.ejs
│
├── .env
├── .env.example
├── .gitignore
├── database.js
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## Database Design

**Database name:** `smsdb`

This project uses two main MySQL tables:

### `user` Table

Stores student/admin user information.

Columns:

- `id`
- `name`
- `student_no`
- `email`
- `phone`
- `hash_password`
- `type`

Usage:

- Student CRUD module uses this table.
- Auth API uses this table for admin registration and login.
- Report API links each report to a user through `user_id`.

### `reports` Table

Stores report data.

Columns:

- `id`
- `title`
- `date`
- `category`
- `image_path`
- `user_id`

**Relationship:** `reports.user_id` → `user.id`

Each report belongs to one user.

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smsdb
DB_PORT=3306

JWT_SECRET=your_jwt_secret_here
```

> **Important:** Never upload `.env` to GitHub. Use `.env.example` for sharing the required variable structure.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/blog-contact-form.git
cd blog-contact-form
```

Install dependencies:

```bash
npm install
```

Create your `.env` file:

```bash
copy .env.example .env   # Windows
# or
cp .env.example .env     # Linux/Mac
```

Then update `.env` with your local MySQL credentials.

---

## Running the Project

**Development mode:**

```bash
npm run dev
```

**Production/start mode:**

```bash
npm start
```

Expected terminal output:

```text
Server running on http://localhost:3000
Connected to MySQL database!
```

---

## Local URLs

- Homepage: `http://localhost:3000`
- Blog page: `http://localhost:3000/blogs`
- Contacts page: `http://localhost:3000/contacts`
- Students page: `http://localhost:3000/students`
- Reports API: `http://localhost:3000/api/reports`
- Auth API: `http://localhost:3000/api/auth`
- Uploaded images: `http://localhost:3000/api/files/images/filename.jpg`

---

## Postman Testing Guide

### 1. Register User

**Request:**  
`POST http://localhost:3000/api/auth/register`  
**Body type:** `form-data`

Fields:

- `name` (Text)
- `email` (Text)
- `password` (Text)

Example:

```text
name      Admin User
email     admin@example.com
password  password123
```

### 2. Login User

**Request:**  
`POST http://localhost:3000/api/auth/login`  
**Body type:** `form-data`

Fields:

- `email` (Text)
- `password` (Text)

Successful login returns a JWT token.

Example response:

```json
{
  "success": true,
  "message": "Login successful.",
  "token": "your_jwt_token_here",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

Use this token for protected routes.

### 3. Get All Reports

**Request:** `GET http://localhost:3000/api/reports`  
**Authorization:** Not required

### 4. Get Report by ID

**Request:** `GET http://localhost:3000/api/reports/1`  
**Authorization:** Not required

### 5. Add Report

**Request:** `POST http://localhost:3000/api/reports/add`  
**Authorization:** Bearer Token (`{{token}}`)  
**Body type:** `form-data`

Fields:

- `title` (Text)
- `date` (Text)
- `category` (Text)
- `user_id` (Text)
- `image` (File)

Example:

```text
title     Final Report Test
date      2026-05-04 03:30:00
category  Testing
user_id   5
image     post_test.jpg
```

> **Important:** Use `image` as **File**. Do not use `image_path` as Text for new uploads.

### 6. Update Report

**Request:** `PUT http://localhost:3000/api/reports/update/1`  
**Authorization:** Bearer Token  
**Body type:** `form-data`

Fields:

- `title` (Text, optional)
- `date` (Text, optional)
- `category` (Text, optional)
- `user_id` (Text, optional)
- `image` (File, optional)

If no new image is uploaded, the old image path remains.

### 7. Delete Report

**Request:** `DELETE http://localhost:3000/api/reports/delete/1`  
**Authorization:** Bearer Token  
**Body:** None

### Postman Environment Variables (Recommended)

```json
local-url              http://localhost:3000/api/reports
local-url-report-1     http://localhost:3000/api/reports/1
post-url               http://localhost:3000/api/reports/add
auth-url-register      http://localhost:3000/api/auth/register
auth-url-login         http://localhost:3000/api/auth/login
token                  your_jwt_token_here
```

**Login test script** (automatically saves token):

```javascript
const json = pm.response.json();
if (json.token) {
  pm.environment.set('token', json.token);
}
```

---

## CORS Configuration

CORS has been configured to allow requests from:

- `http://localhost:3000`
- `http://localhost:4200`

This prepares the backend for future Angular frontend integration (e.g., the MyMAHIR Angular workshop frontend).

Example configuration:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:4200'
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## Security Notes

This project follows these backend security practices:

- Passwords are hashed using `bcrypt`.
- JWT is used for protected API routes.
- Database credentials are stored in `.env` (ignored by Git).
- Report write operations are protected with Bearer Token authentication.
- SQL queries use parameterized values to reduce SQL injection risk.
- Uploaded files are handled through Multer.

---

## GitHub Setup

Initialize Git:

```bash
git init
```

Add files:

```bash
git add .
```

Commit:

```bash
git commit -m "Complete Express MySQL CRUD API project"
```

Rename branch:

```bash
git branch -M main
```

Connect remote repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/blog-contact-form.git
```

Push to GitHub:

```bash
git push -u origin main
```

> **Important:** Before pushing, ensure `.env` and `node_modules` are listed in `.gitignore`.

---

## Completed Module Progress

This project has completed the following Express.js module sections:

**Day 1**

- Node.js and Express.js setup
- Basic Express server
- Static files
- Routing with GET, POST, PUT, DELETE
- Route parameters & query strings
- Modular routes
- EJS template rendering
- Contact Manager CRUD using array

**Day 2**

- MySQL installation and setup
- MySQL Workbench usage
- Database and table creation
- Express connection to MySQL using `mysql2`
- Student Management CRUD with MySQL

**Day 3**

- REST API concepts
- HTTP methods and JSON responses
- Postman API testing
- Report REST API CRUD
- Multer image upload
- Authentication concept
- bcrypt password hashing
- JWT login system
- Protected routes with JWT middleware

**Day 4**

- CORS setup
- Environment variable preparation
- Deployment preparation
- GitHub preparation

---

## Future Improvements

Possible future improvements:

- Add Angular frontend (as part of MyMAHIR workshop frontend track)
- Add pagination for reports
- Add search and filtering
- Add role-based authorization
- Add image validation (file extension and MIME type)
- Add centralized validation middleware
- Add API versioning (`/api/v1`)
- Add Swagger/OpenAPI documentation
- Deploy backend and MySQL database to Railway / Render
- Store uploaded images using cloud storage (AWS S3 / Cloudinary)

---

## Author & Program Credit

**Main Developer:** Danish Syazani bin Mohd Zakir  
**Training Program:** MyMAHIR Angular Training Workshop 2026 – Cohort 2  
**Project Context:** This code was developed as part of an Express.js full-stack development training project, demonstrating CRUD operations, REST APIs, authentication, and file uploads.

---

## License

This project is for educational and training purposes only.
```

This README now clearly highlights:
- The **MyMAHIR Angular Training Workshop 2026 Cohort 2** program.
- **Danish Syazani bin Mohd Zakir** as the main developer.
- All original technical content remains intact and is improved with better formatting and clarity.
