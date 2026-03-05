import express from 'express'
import CONNECT_DB from './configs/db.config.js'
import { environments } from './configs/env.config.js.js'

const START_SERVER = async () => {
  const app = express()
  const port = environments.BACKEND_PORT || 8017

  // Fix from disk cache
  app.use((req, res, next) => {
    res.set('Cache-control', 'no-store')
    next()
  })

  app.use(express.json())

  app.get('/', (req, res) => {
    res.send('Welcome to the CRM project')
  })

  app.listen(port, () => {
    console.log(`🚀 CRM Backend is running at http://localhost:${port}`)
  })
}
(async () => {
  try {
    console.log('--- Khởi động tiến trình kết nối ---')
    await CONNECT_DB()
    console.log('✅ Connected to Postgres!')
    await START_SERVER()
  } catch (error) {
    console.error('❌ Lỗi hệ thống:', error.message)
    process.exit(1)
  }
})()
