import dotenv from 'dotenv'

dotenv.config()

export const environments = {
  // Backend dev
  API_PORT: process.env.NODE_ENV === 'production'
    ? process.env.PROD_PORT_BE
    : process.env.DEV_PORT_BE,

  // Database
  DB_HOST:  process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,

  // Link host
  HOST: process.env.HOST
}