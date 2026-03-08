import dotenv from 'dotenv'

dotenv.config()

export const environments = {
  // Backend
  API_PORT:  process.env.BACKEND_PORT,
  // Database
  DB_HOST:  process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD
}