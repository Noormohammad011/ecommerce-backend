import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import ErrorResponse from '../utils.js/errorResponse.js'
import sendEmail from '../utils.js/sendEmail.js'
import { v2 as cloudinary } from 'cloudinary'
import crypto from 'crypto'
import { getAll, getOne, updateOne } from './handleFactory.js'
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public

const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, avatar } = req.body

  const user = await User.create({
    name,
    email,
    password,
    avatar,
  })
  sendTokenResponse(user, 200, res)
})

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400))
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }
  user.password = undefined

  sendTokenResponse(user, 200, res)
})

//@dec         Log user out / clear cookie
//@route       GET /api/v1/auth/logout
//@access      Public
const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, data: {} })
})

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private

const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password')
  res.status(200).json({
    success: true,
    data: user,
  })
})

//@dec    Forgot password
//@route  POST /api/v1/auth/forgotpassword
//@access Public

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    })

    res.status(200).json({ success: true, data: `Email send to ${user.email}` })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({ validateBeforeSave: false })
    return next(new ErrorResponse('Email could not be sent', 500))
  }
})
// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public

const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  })

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400))
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorResponse('Password do not match', 400))
  }
  // Set new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendTokenResponse(user, 200, res)
})
// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    avatar: req.body.avatar,
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })

  res.status(200).json({
    success: true,
    data: user,
  })
})

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password')

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401))
  }

  user.password = req.body.newPassword
  await user.save()

  sendTokenResponse(user, 200, res)
})

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  //Create token
  const token = user.getSignedJwtToken()
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  if (process.env.NODE_ENV === 'production') {
    options.secure = true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user,
  })
}

//@dec          getAlluser
//@route        GET /api/v1/auth/users
//@access       Private/Admin

const getUsers = getAll(User)

//@dec          getSingleuser
//@route        GET /api/v1/auth/users/:id
//@access       Private/Admin

const getUser = getOne(User)

//@dec          updateSingleUser
//@route        PUT /api/v1/auth/users/:id
//@access       Private/Admin

const updateUser = updateOne(User)

//@dec          deleteSingleUser
//@route        DELETE /api/v1/auth/users/:id
//@access       Private/Admin

const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    return next(new ErrorResponse('User not found', 404))
  }
  const image_id = user.avatar.public_id
  if (image_id) {
    await cloudinary.uploader.destroy(image_id)
  }
  await user.remove()
  res.status(200).json({
    success: true,
    data: {},
  })
})

export {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
}
