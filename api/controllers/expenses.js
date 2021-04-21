const ExpenseModel = require('../models/expenses')
const { validationResult } = require('express-validator')
const dotenv = require('dotenv')
dotenv.config()

class Expenses {
  static async getExpenses(req, res, next) {
    try {
      const currentPage = Number(req.query.currentPage || process.env.CURRENT_PAGE)
      const perPage = Number(req.query.perPage || process.env.PER_PAGE)
      const userExpenses = await ExpenseModel
        .find({ user: req.userId })
        .select('-__v -createdAt -updatedAt')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
      
      let message = 'user resource listings';

      if(userExpenses.length <= 0) {
        message = 'no resource'
      }
      res.status(200).json({
        data: userExpenses,
        message: message
      })
    }
    catch(err) {
      console.log(err)
      if(!err.statusCode) {
        err.message = 'internal server error'
        next(err)
      }
    }
  }

  static async addExpenses(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.mapped(),
        data: 'validation failed'
      })
    }
    try {
      const expenseTitle = req.body.title
      const amount = req.body.amount
      const user = req.userId
      const newExpense = await new ExpenseModel({
        user: user,
        title: expenseTitle,
        amount: amount
      }).save()
      res.status(201).json({
        statusCode: 200,
        data: {
          expense: newExpense.title,
          amount: newExpense.amount,
          createdAt: newExpense.createdAt
        }
      })
    }
    catch(err) {
      if(!err.statusCode) {
        err.message = 'internal server error'
        next(err)
      }
    }
  }

  static async getProduct(req, res, next) {
    const expenseId = req.params.expenseId
    try {
      const expense = await ExpenseModel
        .findOne({ user:req.userId, _id: expenseId })
        .select('-__v -updatedAt')
      if(!expense) {
        const error = new Error('resource not found')
        error.statusCode = 404
        error.data = []
        return next(error)
      }
      res.status(200).json({
        status: 200,
        message: 'expense resource',
        data: expense
      })
    }
    catch(err) {
      if(!err.statusCode) {
        err.message = 'internal server error'
        next(err)
      }
    }
  }

  static async updateProduct(req, res, next) {
    const expenseId = req.params.expenseId
    try {
      const expenseTitle = req.body.title
      const amount = req.body.amount
      const user = req.userId 
      const expense = await ExpenseModel.findById(expenseId)
      if(!expense) {
        const error = new Error('expense resource not found')
        error.statusCode = 404
        return next(error)
      }
      const checkAvailability = await ExpenseModel
        .findOne({ title: expenseTitle, user: user })
        if(checkAvailability) {
        const error = new Error('expense resource already exists')
        error.statusCode = 409
        error.data = []
        return next(error)
      }
      expense.title = expenseTitle
      expense.amount = amount
      const result = await expense.save()
      res.status(200).json({
        status: 200,
        message: 'resource updated',
        data: result
      })
    }
    catch(err) {
      if(!err.statusCode) {
        err.message = 'internal server error'
        next(err)
      }
    }
  }

  static async deleteExpense(req, res, next) {
    const expenseId = req.params.expenseId
    try {
      const expense = await ExpenseModel.findOne({ user: req.userId, _id: expenseId })
      if(!expense) {
        const error = new Error('permission denied')
        error.statusCode = 403
        return next(error)
      }
      const processDelete = expense.delete()
      res.status(200).json({
        message: 'resource deleted',
        statusCode: 200
      })
    }
    catch(err) {
      if(!err.statusCode) {
        err.message = 'internal server error'
        err.statusCode = 500
        next(err)
      }
    }
  }
}

module.exports = Expenses