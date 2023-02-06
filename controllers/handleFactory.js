import asyncHandler from 'express-async-handler'
import ErrorResponse from '../utils.js/errorResponse.js'

const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id)
    if (!doc) {
      return next(new ErrorResponse(`No document found with that ID`, 404))
    }
    doc.remove()
    res.status(200).json({ success: true, data: {} })
  })

const updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!doc) {
      return next(new ErrorResponse(`No document found with that ID`, 404))
    }
    res.status(200).json({ success: true, data: doc })
  })

const createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id
    const doc = await Model.create(req.body)

    res.status(201).json({
      success: true,
      data: {
        data: doc,
      },
    })
  })

const getOne = (Model, popOptions) =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new ErrorResponse(`No document found with that ID`, 404))
    }

    res.status(200).json({
      success: true,
      data: {
        data: doc,
      },
    })
  })

const getAll = () =>
  asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
  })
export { deleteOne, updateOne, createOne, getOne, getAll }
