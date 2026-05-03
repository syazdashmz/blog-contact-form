require('dotenv').config();

const mysql = require('mysql2/promise');

const database = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smsdb',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testDatabaseConnection() {
  try {
    const connection = await database.getConnection();
    console.log('Connected to MySQL database!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

module.exports = {
  database,
  testDatabaseConnection
};