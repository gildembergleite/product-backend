import { PrismaClient } from "@prisma/client";
import { Router } from "express";


const prisma = new PrismaClient()
const router = Router()

router.get('/', async (_, res) => {
  const products = await prisma.product.findMany()
  res.json(products)
})

router.get('/:id', async (req, res) => {
  const { id } = req.params
  const product = await prisma.product.findUnique({
    where: {
      id: Number(id)
    }
  })
  
  if (product) {
    res.json(product)
  } else {
    res.status(404).json({ error: 'Produto não encontrado' })
  }
})

router.post('/', async (req, res) => {
  const { name, category, price } = req.body

  try {
    const product = await prisma.product.create({
      data: { name, category, price: parseFloat(price) }
    })

    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Não foi possível criar o produto' })
  }
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { name, category, price } = req.body

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, category, price: parseFloat(price) }
    })
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Não foi possível atualizar o produto' })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const product = await prisma.product.delete({
      where: { id: Number(id) }
    })
    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Não foi possível deletar o produto' })
  }
})