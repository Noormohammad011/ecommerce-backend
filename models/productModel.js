import mongoose from 'mongoose'
import slugify from 'slugify'
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxLength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxLength: [5, 'Product name cannot exceed 5 characters'],
      default: 0.0,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please select category for this product'],
      enum: {
        values: [
          'Electronics',
          'Cameras',
          'Laptops',
          'Accessories',
          'Headphones',
          'Food',
          'Books',
          'Clothes/Shoes',
          'Beauty/Health',
          'Sports',
          'Outdoor',
          'Home',
        ],
        message: '{VALUE} is not a valid name',
      },
    },
    seller: {
      type: String,
      required: [true, 'Please enter product seller'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      maxLength: [5, 'Product name cannot exceed 5 characters'],
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },

  {
    timestamps: true,
  }
)

//create product slug for name
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

const Product = mongoose.model('Product', productSchema)
export default Product
