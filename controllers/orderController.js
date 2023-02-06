import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import ErrorResponse from '../utils.js/errorResponse.js'
import { deleteOne, getOne } from './handleFactory.js'
import Product from '../models/productModel.js'

// @desc      Get all orders
// @route     GET /api/v1/orders
// @access    Private/Admin

const getOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().sort('-createdAt')

  let totalAmount = 0

  orders.forEach((order) => {
    totalAmount += order.totalPrice
  })
  res.status(200).json({ success: true, totalAmount, data: orders })
})

// @desc      Get single order
// @route     GET /api/v1/orders/:id
// @access    Private/Admin

const getOrder = getOne(Order, {
  path: 'user',
  select: 'name email',
})

// @desc      Update order to delivered
// @route     PUT /api/v1/orders/:id/deliver
// @access    Private/Admin

const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorResponse(`Order has already been delivered`, 400))
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity)
  })

  order.orderStatus = req.body.status
  order.deliveredAt = Date.now()

  await order.save()

  res.status(200).json({
    success: true,
    data: order,
  })
})

async function updateStock(id, quantity) {
  const product = await Product.findById(id)

  product.stock = product.stock - quantity

  await product.save({ validateBeforeSave: false })
}

// @desc      Update order to paid
// @route     Delete /api/v1/orders/:id
// @access    Private

const delteOrder = deleteOne(Order)

// @desc      Get logged in user orders
// @route     GET /api/v1/orders/myorders
// @access    Private

const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })

  res.status(200).json({
    success: true,
    data: orders,
  })
})

// @desc      Create new order
// @route     POST /api/v1/orders
// @access    Private

const addOrderItems = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body

  const order = await Order.create({
    orderItems,
    shippingInfo: shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  })

  res.status(200).json({
    success: true,
    data: order,
  })
})

export {
  getOrders,
  getOrder,
  updateOrderToDelivered,
  delteOrder,
  getMyOrders,
  addOrderItems,
}
