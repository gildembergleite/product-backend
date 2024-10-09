import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { productRouter } from './routes/products'
import { setupSwagger } from './swagger'

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())
app.use('/api/products', productRouter)

setupSwagger(app)

const PORT = process.env.PORT || 3333

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})