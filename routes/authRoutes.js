import express from 'express'
import {
  forgotPassword,
  getMe,
  getUsers,
  login,
  logout,
  register,
  resetPassword,
  updateDetails,
  updatePassword,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/authControllers.js'
//middleware
import advancedResults from '../middleware/advancedResults.js'
import { authorize, protect } from '../middleware/authMiddleware.js'
import User from '../models/userModel.js'

const router = express.Router()

router.route('/login').post(login)
router.route('/logout').get(protect, logout)
router.route('/register').post(register)
router.route('/me').get(protect, getMe)
router.route('/forgotpassword').post(forgotPassword)
router.route('/resetpassword/:resettoken').put(resetPassword)
router.route('/updatedetails').put(protect, updateDetails)
router.route('/updatepassword').put(protect, updatePassword)
router
  .route('/users')
  .get(protect, authorize('admin'), advancedResults(User), getUsers)
router
  .route('/users/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser)

export default router
