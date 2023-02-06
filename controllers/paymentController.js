import asyncHandler from 'express-async-handler'
import * as dotenv from 'dotenv'
dotenv.config()
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STIPE_SECRET_KEY)

// @desc    Create stripe payment intent
// @route   POST /api/v1/payment/stripe
// @access  Private

const stripePayment = asyncHandler(async (req, res) => {
  const { amount } = req.body
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: { integration_check: 'accept_a_payment' },
  })
  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  })
})

export { stripePayment }
