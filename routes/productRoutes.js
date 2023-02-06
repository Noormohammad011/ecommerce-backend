import express from 'express'
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/prodcutContorller.js'
import Product from '../models/productModel.js'
//middleware
import advancedResults from '../middleware/advancedResults.js'
import { authorize, protect } from '../middleware/authMiddleware.js'


const router = express.Router()

router
  .route('/adminProducts')
  .get(protect, authorize('admin'), getAdminProducts)
router
  .route('/')
  .get(
    advancedResults(Product, {
      path: 'user',
      select: '_id name email',
    }),
    getProducts
  )
  .post(protect, authorize('admin'), createProduct)
router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct)

export default router
