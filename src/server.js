import express from 'express'
import CONNECT_DB from './configs/config.db.js'
import { environments } from './configs/environments.js'

const START_SERVER = async () => {
  const app = express()
  const port = environments.API_PORT || 8017

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
