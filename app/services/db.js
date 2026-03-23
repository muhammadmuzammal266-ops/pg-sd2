const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "db",
  user: process.env.MYSQL_USER || "admin",
  password: process.env.MYSQL_PASS || "password",
  database: process.env.MYSQL_DATABASE || "sd2-db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      console.error("DATABASE ERROR:", err.message);
      throw err;
    }
  }
};;