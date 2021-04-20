const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

class middleware {
  static verifyToken(req, res, next) {
    try {
      const userToken = req.headers.authorization
      if(!userToken) {
        const error = new Error('token not found')
        error.statusCode = 404
        throw error
      }
      let token = userToken.split(' ')[1]
      const user = jwt.verify(token, process.env.TOKEN_SECRET)
      if(!user) {
        const error = new Error('unverifiable token')
        error.statusCode = 400
        throw error
      }
      req.userId = user.userId
      req.userName = user.name
      next()
    }
    catch(err) {
      err.statusCode = 500
      err.errorMessage = 'internal server error'
      next(err)
    }
  }
}

module.exports = middleware


