import express from 'express'
import { authController } from './auth.controller.js'
import { authValidator } from './auth.validator.js'
import { authMiddleware } from './auth.middleware.js'

const Router = express.Router()

// ===== PUBLIC ROUTES =====
// POST /api/auth/register
Router.post('/register', authValidator.register.bind(authValidator), authController.register.bind(authController))

// POST /api/auth/login
Router.post('/login', authValidator.login.bind(authValidator), authController.login.bind(authController))

// POST /api/auth/refresh-token
Router.post('/refresh-token', authController.refreshToken.bind(authController))

// POST /api/auth/setup-superadmin
Router.post('/setup-superadmin', authController.setupSuperAdmin.bind(authController))

// POST /api/auth/forgot-password
Router.put('/forgot-password', authController.forgotPassword.bind(authController))

// ===== PROTECTED ROUTES (require auth middleware) =====
// POST /api/auth/logout
Router.post('/logout', authMiddleware, authController.logout.bind(authController))

// POST /api/auth/logout-all
Router.post('/logout-all', authMiddleware, authController.logoutAll.bind(authController))

// PUT /api/auth/change-password
Router.put('/change-password', authMiddleware, authController.changePassword.bind(authController))

// GET /api/auth/profile
Router.get('/profile', authMiddleware, authController.getProfile.bind(authController))

// PUT /api/auth/profile
Router.put('/profile', authMiddleware, authController.updateProfile.bind(authController))

export const authRoutes = Router
