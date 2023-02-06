import express from 'express'
import chalk from 'chalk'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import helmet from 'helmet'
import hpp from 'hpp'
import * as dotenv from 'dotenv'
import connectDB from './config/db.js'
import fileUpload from 'express-fileupload'
import cookieParser from 'cookie-parser'
import compression from 'express-compression'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import { v2 as cloudinary } from 'cloudinary'
//import router
import productRoutes from './routes/productRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewsRoutes from './routes/reviewRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

//import middlewares
import morgan from 'morgan'
import path from 'path'

//dotenv config
dotenv.config()
//express configuration
const app = express()

// compress all responses
app.use(compression())

//conncet to database
connectDB()
//morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('tiny'))
}

// For parsing application/json
app.use(express.json())
app.use(cookieParser())
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))
// Enable cors
app.use(cors())
// Enable file upload
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
})
//file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
)

//sanitize data
app.use(mongoSanitize())

//set security headers
app.use(helmet())

//prevent xss attacks
app.use(xss())

//prevent http param pollution
app.use(hpp())

//set static folder
app.use(express.static(path.join(path.dirname(''), 'public')))

//route mount
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/reviews', reviewsRoutes)
app.use('/api/v1/upload', uploadRoutes)
app.use('/api/vi/payment', paymentRoutes)

//middleware for error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(
  PORT,
  console.log(
    chalk.cyan.underline(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  )
)
