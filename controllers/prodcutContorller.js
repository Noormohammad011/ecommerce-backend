import Product from '../models/productModel.js'
import asyncHandler from 'express-async-handler'
import { v2 as cloudinary } from 'cloudinary'
import ErrorResponse from '../utils.js/errorResponse.js'
import { getAll, getOne } from './handleFactory.js'

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public

const getProducts = getAll(Product)

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public

const getProduct = getOne(Product)

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private

const createProduct = asyncHandler(async (req, res, next) => {
  let images = []
  if (typeof req.body.images === 'string') {
    images.push(req.body.images)
  } else {
    images = req.body.images
  }

  let imagesLinks = []

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: 'product',
      use_filename: true,
      width: 150,
      croup: 'scale',
    })

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    })
  }

  req.body.images = imagesLinks
  req.body.user = req.user.id

  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

//@dec      get admin all products
//@route    GET /api/v1/admin/products
//@access   Private

const getAdminProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({
    success: true,
    products,
  })
})

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private

const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorResponse('Product not found', 404))
  }
  let images = []
  if (typeof req.body.images === 'string') {
    images.push(req.body.images)
  } else {
    images = req.body.images
  }

  if (images !== undefined) {
    // Deleting images associated with the product
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.uploader.destroy(product.images[i].public_id)
    }

    let imagesLinks = []

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.uploader.upload(images[i], {
        folder: 'product',
      })

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      })
    }

    req.body.images = imagesLinks

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      product,
    })
  }
})

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorHandler('Product not found', 404))
  }
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id)
  }

  await product.remove()

  res.status(200).json({
    success: true,
    message: 'Product is deleted.',
  })
})

//@dec     create new review
//@route   PUT /api/v1/review
//@access  Private

const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  )

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment
        review.rating = rating
      }
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  })
})

// @desc    Get product review
// @route   GET /api/v1/reviews
// @access  Private

const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id)

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  })
})

//@dec   Get prodcut review by id
//@route GET /api/v1/reviews/:id
//@access Public

const getProductReviewById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return next(new ErrorResponse('Product not found', 404))
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  })
})

//@dec    delete product review
//@route  DELETE /api/v1/reviews
//@access Private

const deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  )

  const numOfReviews = reviews.length

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

  const updateReviews = await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  )

  res.status(200).json({
    success: true,
    reviews: updateReviews.reviews,
  })
})

export {
  deleteProduct,
  updateProduct,
  createProduct,
  getProduct,
  getProducts,
  deleteReview,
  getProductReviews,
  createProductReview,
  getProductReviewById,
  getAdminProducts,
}
