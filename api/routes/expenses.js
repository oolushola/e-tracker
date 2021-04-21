const express = require('express')
const { body } = require('express-validator')
const middleware = require('../middleware/middleware')
const expensesController = require('../controllers/expenses')
const ExpenseModel = require('../models/expenses')

const router = express.Router()

router.get(
  '/expenses',
  middleware.verifyToken,
  expensesController.getExpenses
)

router.post(
  '/expense',
  middleware.verifyToken,
  [
    body('title')
      .isString()
      .notEmpty()
      .isLength({ min: 2 })
      .trim()
      .toLowerCase()
      .custom((value, { req }) => {
        return ExpenseModel.findOne({ 
          title: value
        })
        .then(expense => {
          if(expense) {
            return Promise.reject('expense resource exists')
          }
        })
      }),
    body('amount')
      .isNumeric()
      .notEmpty()
      .trim()
  ],
  expensesController.addExpenses
)

router.get(
  '/expense/:expenseId',
  middleware.verifyToken,
  expensesController.getProduct
)

router.put(
  '/expense/:expenseId',
  middleware.verifyToken,
  [
    body('title')
      .isString()
      .notEmpty()
      .isLength({ min: 2 })
      .trim()
      .toLowerCase(),
    body('amount')
      .isNumeric()
      .notEmpty()
      .trim()
  ],
  expensesController.updateProduct
)

router.delete(
  '/expense/:expenseId',
  middleware.verifyToken,
  expensesController.deleteExpense
)

module.exports = router