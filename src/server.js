import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import CONNECT_DB from './configs/db.config.js'
import { environments } from './configs/env.config.js'
import { APIs_Routes } from './routes/index.js'
import { swaggerSpec } from './configs/swagger.config.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { corsOptions } from './configs/cors.config.js'

// Server entry point - CORS set to allow all
const START_SERVER = async () => {
  const app = express()
  const port = environments.API_PORT || 8017

  // Fix from disk cache
  app.use((req, res, next) => {
    res.set('Cache-control', 'no-store')
    next()
  })


  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())

  app.get('/', (req, res) => {
    res.send('Welcome to the CRM project')
  })

  app.use('/api', APIs_Routes)
  app.use(
    '/api/docs/v1',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        persistAuthorization: true
      }
    })
  )
  app.use(errorMiddleware)

  const host = (process.env.NODE_ENV === 'production' || !environments.HOST || environments.HOST === 'localhost' || environments.HOST === '127.0.0.1')
    ? '0.0.0.0'
    : environments.HOST

  app.listen(port, host, () => {
    console.log(`🚀 CRM mini APIs is running at http://${host}:${port}`)
    console.log(`🚀 CRM mini DOCs is running at http://${host}:${port}/api/docs/v1`)
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
