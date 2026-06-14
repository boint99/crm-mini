import express from 'express'
import { authController } from './auth.controller.js'
import { authMiddleware } from './auth.middleware.js'

const Router = express.Router()

// ===== PUBLIC ROUTES =====
// POST /api/auth/register
Router.post('/register', authController.register)

// POST /api/auth/login
Router.post('/login',authController.login)

// POST /api/auth/refresh-token
Router.post('/refresh-token', authController.refreshToken)

// POST /api/auth/setup-superadmin
Router.post('/setup-superadmin', authController.setupSuperAdmin)

// POST /api/auth/forgot-password
Router.put('/forgot-password', authController.forgotPassword)

// ===== PROTECTED ROUTES (require auth middleware) =====
// POST /api/auth/logout
Router.post('/logout', authMiddleware, authController.logout)

// POST /api/auth/logout-all
Router.post('/logout-all', authMiddleware, authController.logoutAll)

export const authRoutes = Router
