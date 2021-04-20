const ExpenseModel = require('../models/expenses')
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
}

module.exports = Expenses