const express = require('express')
const { body } = require('express-validator')
const middleware = require('../middleware/middleware')
const expensesController = require('../controllers/expenses')

const router = express.Router()

router.get(
  '/expenses',
  middleware.verifyToken,
  expensesController.getExpenses
)

module.exports = router