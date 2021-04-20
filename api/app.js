const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const router = require('./routes/route')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8081
const CONNECTION_STRING = process.env.MONGO_URI
const BASE_URL = process.env.BASE_URL

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'PUT, PATCH, POST, GET, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use(`/api/v1`, router)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500
  const message = error.message
  const errorData = error.data
  res.status(status).json({
    error: errorData,
    response: message
  })
})

app.use('*', (req, res, next) => {
  res.status(404).json({
    error: 'page not found',
    statusCode: 404
  })
})


mongoose.connect(
  CONNECTION_STRING,
  { useNewUrlParser: true, useUnifiedTopology: true  }
)
.then((client) => {
  app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`)
  })
})
.catch(err => {
  throw new Error('CONNECTION FAILED', err)
})


