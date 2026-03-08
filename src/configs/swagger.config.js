import swaggerJsdoc from 'swagger-jsdoc'

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
        url: 'http://localhost:8017'
      }
    ]
  },
  apis: ['./src/docs/*.yml']
}

export const swaggerSpec = swaggerJsdoc(swaggerOptions)

