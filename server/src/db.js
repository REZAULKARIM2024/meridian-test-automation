import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "meridian_health",
  waitForConnections: true,
  connectionLimit: 20,
  namedPlaceholders: true,
});

/** Simple helper: run a query, return rows only. */
export async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
