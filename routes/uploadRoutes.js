import express from 'express'
import __dirname from 'path'
import asyncHandler from 'express-async-handler'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const router = express.Router()

router.post(
  '/avatar',
  asyncHandler(async (req, res) => {
    const result = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: 'avatarImage',
        use_filename: true,
        width: 150,
        croup: 'scale',
      }
    )
    fs.rm('tmp', { recursive: true }, (err) => {
      if (err) {
        throw err
      }
    })
    return res.status(200).json({
      avatar: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    })
  })
)

router.post(
  '/productImages',
  asyncHandler(async (req, res) => {
    let images = []
    const files = req.files.images
    for (let i = 0; i < files.length; i++) {
      const result = await cloudinary.uploader.upload(files[i].tempFilePath, {
        folder: 'product',
        use_filename: true,
        width: 150,
        croup: 'scale',
      })
      images.push({
        public_id: result.public_id,
        url: result.secure_url,
      })
    }
    fs.rm('tmp', { recursive: true }, (err) => {
      if (err) {
        throw err
      }
    })

    return res.status(200).json({
      images,
    })
  })
)

export default router
