const UserModel = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')

const fileStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    const name = crypto.randomBytes(8).toString('hex')
    const photoExt = file.originalname.split('.')[1]
    const photoName = name+'.'+photoExt
    cb(null, photoName)
  },
  destination: (req, file, cb) => {
    cb(null, 'public/users')
  }
})

const fileFilter = (req, file, cb) => {
  if(
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true)
  }
  else {
    cb(null, false)
  }
}

const uploadPhoto = multer({ 
  storage: fileStorage, 
  fileFilter: fileFilter 
}).single('photo')

class userController {
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

  static async uploadPhoto(req, res, next) {
    const userId = req.userId
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
      const error = new Error('validation failed')
      error.statusCode = 422
      return next(error)
    }
    let result;
    try {
      const photo = req.file
      if(!photo) {
        const error = new Error('no photo')
        error.statusCode = 422
        return next(error)
      }
      const photoUrl = req.file.path
      const user = await UserModel.findById(userId)   
      if(user.photo) {
        deletePhoto(user.photo)
      }   
      user.photo = photoUrl
      result = await user.save()
      res.status(200).json({
        status: 200,
        data: result
      })
    }
    catch(err) {
      if(!err.statusCode) {
        next(err)
      }
    }
  }
}

const deletePhoto = (photoPath) => {
  const photoDir = path.join(__dirname, '..', photoPath)
  return fs.unlink(photoDir, (err, data) => {
    if(err) {
      console.log('Error deleting file: ', err)
    }
    else {
      console.log('DELETED')
    }
  })

  console.log(rootDir)
}

module.exports = {
  userController,
  uploadPhoto
}