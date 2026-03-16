import swaggerJsdoc from 'swagger-jsdoc'
import { environments } from './env.config.js'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRM API',
      version: '1.0.0',
      description: 'API documentation for CRM MINI'
    },
    servers: [
      {
        url: `http://${environments.HOST}:${environments.API_PORT}`
      }
    ]
  },
  apis: ['./src/docs/*.yml']
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)

