import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");

  console.log("Applying schema.sql ...");
  await conn.query(schema);
  console.log("Applying seed.sql ...");
  await conn.query(seed);
  console.log("Database ready: meridian_health");

  await conn.end();
}

run().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exit(1);
});
