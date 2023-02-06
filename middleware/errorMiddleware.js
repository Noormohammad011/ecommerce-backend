import ErrorResponse from '../utils.js/errorResponse.js'

const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message

  // Log to console for dev
  console.log(err)

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered'
    error = new ErrorResponse(message, 400)
  }

  //auth error
  if (err.code === 'credentials_required') {
    const message = 'No authorization token was found'
    error = new ErrorResponse(message, 401)
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message)
    error = new ErrorResponse(message, 400)
  }
  // Handling wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid. Try Again!!!'
    error = new ErrorResponse(message, 400)
  }

  // Handling Expired JWT error
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token is expired. Try Again!!!'
    error = new ErrorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  })
}

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

export { notFound, errorHandler }
