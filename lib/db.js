import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log("Executed query", { text, duration, rows: res.rowCount })
  return res
}

export async function getClient() {
  const client = await pool.connect()
  return client
}

export default pool
