const mysql = require('mysql2/promise');

const database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Fishermans@1911',
    database: 'smsdb'
});

(async () => {
    try {
        const connection = await database.getConnection();
        console.log('Connected to MySQL database!');
        connection.release();
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

module.exports = database;