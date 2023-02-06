import express from 'express'

//middleware
import { protect } from '../middleware/authMiddleware.js'
import {
  stripePayment,
} from '../controllers/paymentController.js'

const router = express.Router()

router.route('/stripe').post(protect, stripePayment)

export default router
