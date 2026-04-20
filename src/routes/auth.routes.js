import express from 'express'
import { authController } from '../controllers/auth.controller.js'


const Router = express.Router()

// POST /api/auth/register
Router.post('/register', authController.register)

// POST /api/auth/login
Router.post('/login', authController.login)

export const authRoutes = Router