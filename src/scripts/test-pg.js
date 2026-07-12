import pg from 'pg'
import 'dotenv/config'

async function run() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL)
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
  })
  try {
    console.log('Connecting with pg...')
    const res = await pool.query('SELECT 1 as val')
    console.log('✅ pg Query succeeded:', res.rows)
  } catch (err) {
    console.error('❌ pg Query failed:', err.message)
  } finally {
    await pool.end()
  }
}
run()
