import express from 'express'
import { authController } from '../controllers/auth.controller.js'


const Router = express.Router()

// POST /api/accounts/register
Router.post('/register', authController.register)



export const authRoutes = Router