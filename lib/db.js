import mysql from "mysql2/promise";

const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "time_monitoring",
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;
