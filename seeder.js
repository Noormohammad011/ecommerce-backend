import mongoose from 'mongoose'
import dotenv from 'dotenv'
import chalk from 'chalk'
import Product from './models/productModel.js'
import connectDB from './config/db.js'
import products from './data/product.js'

dotenv.config()

connectDB()

const importData = async () => {
  try {
    await Product.deleteMany()
    await Product.insertMany(products)
    console.log(chalk.bgBlackBright.underline('Data Imported!'))
    process.exit()
  } catch (error) {
    console.error(chalk.red.inverse(`${error}`))
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Product.deleteMany()
    console.log(chalk.red.inverse('Data Destroyed!'))
    process.exit()
  } catch (error) {
    console.error(chalk.red.inverse(`${error}`))
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
