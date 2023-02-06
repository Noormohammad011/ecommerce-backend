import mongoose from 'mongoose'
import chalk from 'chalk'
mongoose.set('strictQuery', false)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })

    console.log(
      chalk.greenBright.underline(`MongoDB Connected: ${conn.connection.host}`)
    )
  } catch (error) {
    console.error(chalk.red.underline(`Error: ${error.message}`))
    process.exit(1)
  }
}

export default connectDB
