
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 3,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || 5432),
        max: 3,
      }
);

db.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err.message);
});

export default db;
