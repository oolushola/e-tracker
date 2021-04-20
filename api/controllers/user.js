const UserModel = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class User {
  static async addUser(req, res, next) {
    try {
      const errors = validationResult(req)
      if(!errors.isEmpty()) {
         return res.status(422).json({
           error: 'validation failed',
           statusCode: 422,
           data: errors.mapped()
         })
      }
      const firstName = req.body.firstName
      const lastName = req.body.lastName
      const email = req.body.email
      const password = req.body.password
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword
      })
      const result = await user.save()

      res.status(201).json({
        data: {
          userId: result._id,
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
        },
        message: 'user resource created',
        statusCode: 201
      })
      
    }
    catch(err) {
      if(!err.statusCode) {
        err.statusCode = 500
        err.errorMessage = 'internal server error'
        next(err)
      }
    }
  }

  static async login(req, res, next) {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      return res.status(422).json({
        error: 'validation failed',
        statusCode: 422,
        data: errors.mapped()
      })
    }
    try {
      const email = req.body.email
      const password = req.body.password
      const user = await UserModel.findOne({ email: email })
      const doMatch = await bcrypt.compare(password, user.password)
      if(!doMatch) {
        return res.status(404).json({
          response: 'invalid email & password',
          statusCode: 404
        })
      }
      const token = jwt.sign(
        { userId: user._id, 
          name: `${user.firstName} ${user.lastName}` 
        },
        process.env.TOKEN_SECRET,
        { expiresIn: '2h' }
      )
      res.status(200).json({
        data: {
          token,
          name: `${user.firstName} ${user.lastName}`
        },
        statusCode: 200
      })

    }
    catch(err) {
      if(!err.statusCode) {
        err.message = 'internal server error'
        next(err)
      }
    }
    

    
  }
}

module.exports = User