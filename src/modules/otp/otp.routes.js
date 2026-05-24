import express from 'express'
import { otpController } from './otp.controller.js'

const Router = express.Router()

// POST /api/otp/generate
Router.post('/generate', otpController.generateOtp)

export const otpRoutes = Router
