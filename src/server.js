import express from 'express'
import swaggerUi from 'swagger-ui-express'
import CONNECT_DB from './configs/db.config.js'
import { environments } from './configs/env.config.js'
import { APIs_Routes } from './routes/index.js'
import { swaggerSpec } from './configs/swagger.config.js'
import { errorMiddleware } from './middleware/error.middleware.js'

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

  app.use('/api', APIs_Routes)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use(errorMiddleware)

  app.listen(port, () => {
    console.log(`🚀 CRM mini APIs is running at http://${environments.HOST}:${port}`)
    console.log(`🚀 CRM mini DOCs is running at http://${environments.HOST}:${port}/api-docs`)
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
