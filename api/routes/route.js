const express = require('express')
const userRoute = require('./auth/user')
const expenseRoute = require('./expenses')

const router = express.Router()

router.use(
  userRoute,
  expenseRoute
)

module.exports = router