import express from 'express'

//middleware
import { authorize, protect } from '../middleware/authMiddleware.js'
import {
  addOrderItems,
  delteOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderToDelivered,
} from '../controllers/orderController.js'
const router = express.Router()

router.route('/myorders').get(protect, getMyOrders)
router
  .route('/')
  .get(protect, authorize('admin'), getOrders)
  .post(protect, addOrderItems)
router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin'), updateOrderToDelivered)
  .delete(protect, authorize('admin'), delteOrder)

export default router
