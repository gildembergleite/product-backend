import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
app.use(express.json())

app.use('/api/products')

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})