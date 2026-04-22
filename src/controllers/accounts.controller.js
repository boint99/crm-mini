import { accountsService } from '../services/accounts.service.js'
import { CreatedResponse, SuccessResponse } from '../utils/SuccessResponse.js'

class AccountsController {
  // GET /api/accounts/lists
  async lists(req, res, next) {
    try {
      const result = await accountsService.lists()

      new SuccessResponse({ res, data: result, message: 'Get accounts list successfully.' })
    } catch (error) { next(error) }
  }
  // POST /api/accounts
  async create(req, res, next) {
    try {
      const result = await accountsService.create(req.body)
      new CreatedResponse({ res, data: result, message: 'Account created successfully.' })
    } catch (error) { next(error) }
  }

  // PUT /api/accounts
  async update(req, res, next) {
    try {
      const result = await accountsService.update(req.body)
      new SuccessResponse({ res, data: result, message: 'Account updated successfully.' })
    } catch (error) { next(error) }
  }

  // PATCH /api/accounts/reset-password
  async resetPassword(req, res, next) {
    try {
      const { ACCOUNT_ID, PASSWORD } = req.body
      const result = await accountsService.resetPassword(Number(ACCOUNT_ID), PASSWORD)
      new SuccessResponse({ res, data: result, message: 'Password reset successfully.' })
    } catch (error) { next(error) }
  }

  // DELETE /api/accounts/:id
  async delete(req, res, next) {
    try {
      const { id } = req.params
      await accountsService.delete(id)
      new SuccessResponse({ res, message: 'Account deleted successfully.' })
    } catch (error) { next(error) }
  }
}

export const accountsController = new AccountsController()
