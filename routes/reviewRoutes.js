import express from 'express'
import { authorize, protect } from '../middleware/authMiddleware.js'
import {
  createProductReview,
  deleteReview,
  getProductReviews,
  getProductReviewById,
} from '../controllers/prodcutContorller.js'

const router = express.Router()

router
  .route('/')
  .get(protect, authorize('admin'), getProductReviews)
  .put(protect, createProductReview)
  .delete(protect, authorize('admin'), deleteReview)

router.route('/:id').get(getProductReviewById)

export default router
