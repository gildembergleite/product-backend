import { PrismaClient } from "@prisma/client";
import { Router } from "express";


const prisma = new PrismaClient()
const router = Router()

router.get('/', async (req, res) => {
  const { page = '1', page_size = '10' } = req.query
  
  const pageNumber = parseInt(page as string)
  const pageSizeNumber = parseInt(page_size as string)
  const skip = (pageNumber - 1) * pageSizeNumber

  try {
    const products = await prisma.product.findMany({
      skip,
      take: pageSizeNumber
    })

    const count = await prisma.product.count()
    const totalPages = Math.ceil(count / pageSizeNumber)

    res.json({
      count,
      total_pages: totalPages,
      page_size: pageSizeNumber,
      page: pageNumber,
      results: products
    })
    
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Não foi possível listar os produtos' })
  }
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

  if (!name) {
    res.status(400).json({ error: 'O campo [name] é obrigatório' })
    return
  }

  if (!category) {
    res.status(400).json({ error: 'O campo [category] é obrigatório' })
    return
  }

  if (!price) {
    res.status(400).json({ error: 'O campo [price] é obrigatório' })
    return
  }

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

    if (product) {
      res.json(product)
    } else {
      res.status(400).json({ error: 'Não foi localizado nenhum produto com o id informado' })
    }

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

    if (product) {
      res.status(204).json(product)
    } else {
      res.status(400).json({ error: 'Não foi localizado nenhum produto com o id informado' })
    }
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: 'Não foi possível deletar o produto' })
  }
})