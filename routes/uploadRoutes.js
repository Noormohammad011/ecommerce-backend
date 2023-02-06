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

export default router
