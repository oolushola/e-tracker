const express = require('express')
const { body} = require('express-validator')
const User = require('../../models/user')
const userController = require('../../controllers/user')

const router = express.Router()

router.post(
  '/register',
  [
    body('firstName')
      .isString()
      .isLength({ min: 2 })
      .notEmpty()
      .trim(),
    body('lastName')
      .isString()
      .isLength({ min: 2 })
      .notEmpty()
      .trim(),
    body('email')
      .isEmail()
      .normalizeEmail()
      .trim()
      .notEmpty()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(user => {
              if(user) {
                return Promise.reject('email already exist')
              }
          })
      }),
    body('password')
      .notEmpty()
      .trim()
      .isLength({ min: 8 }),
    body('confirmPassword')
      .custom((value, { req }) => {
        if(value !== req.body.password) {
          throw new Error('Password mismatch')
        }
        return true
      })
  ],
  userController.addUser  
)

module.exports = router