import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Router } from "express";

const prisma = new PrismaClient();
export const productRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         category:
 *           type: string
 *           description: The category of the product
 *         price:
 *           type: number
 *           description: The price of the product
 *       example:
 *         id: 1
 *         name: Product 1
 *         category: Category A
 *         price: 99.99
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Returns the list of all products with pagination
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: The list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 total_pages:
 *                   type: integer
 *                 page_size:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
productRouter.get('/', async (req, res) => {
  const { page = '1', page_size = '10' } = req.query;
  
  const pageNumber = parseInt(page as string);
  const pageSizeNumber = parseInt(page_size as string);
  const skip = (pageNumber - 1) * pageSizeNumber;

  try {
    const products = await prisma.product.findMany({
      skip,
      take: pageSizeNumber,
    });

    const count = await prisma.product.count();
    const totalPages = Math.ceil(count / pageSizeNumber);

    res.json({
      count,
      total_pages: totalPages,
      page_size: pageSizeNumber,
      page: pageNumber,
      results: products,
    });
    
  } catch (err) {
    const error = err as PrismaClientKnownRequestError
    console.error(error.meta);
    res.status(500).json({ error: 'Não foi possível listar os produtos' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: The product description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
productRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
      },
    });
    
    if (product) {
      res.status(201).json(product);
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (err) {
    const error = err as PrismaClientKnownRequestError
    console.error(error.meta);
    res.status(500).json({ error: 'Erro ao buscar o produto' });
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Product]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Missing required fields
 */
productRouter.post('/', async (req, res) => {
  const { name, category, price } = req.body;

  if (!name) {
    res.status(400).json({ error: 'O campo [name] é obrigatório' });
    return;
  }

  if (!category) {
    res.status(400).json({ error: 'O campo [category] é obrigatório' });
    return;
  }

  if (!price) {
    res.status(400).json({ error: 'O campo [price] é obrigatório' });
    return;
  }

  try {
    const product = await prisma.product.create({
      data: { name, category, price: parseFloat(price) },
    });

    res.json(product);
  } catch (err) {
    const error = err as PrismaClientKnownRequestError
    console.error(error.meta);
    res.status(400).json({ error: 'Não foi possível criar o produto' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: The product was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error updating product
 */
productRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: { name, category, price: parseFloat(price) },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(400).json({ error: 'Produto não encontrado!' });
    }

  } catch (err) {
    const error = err as PrismaClientKnownRequestError
    console.error(error.meta);
    res.status(400).json({ error: 'Não foi possível atualizar o produto' });
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       400:
 *         description: Error deleting product
 */
productRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const product = await prisma.product.delete({
      where: { id: Number(id) },
    });

    if (product) {
      res.status(204).end();
    } else {
      res.status(400).json({ error: 'Produto não encontrado!' });
    }

  } catch (err) {
    const error = err as PrismaClientKnownRequestError
    console.error(error.meta);
    res.status(400).json({ error: 'Não foi possível deletar o produto' });
  }
});