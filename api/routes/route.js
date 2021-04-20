const express = require('express')
const userRoute = require('./auth/user')

const router = express.Router()

router.use(
  userRoute
)

module.exports = router