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

// TODO: remover a rota abaixo:

productRouter.get('/ronier', async (req, res) => {
  res.status(200).json([
    {
      "id": 1,
      "nome": "Esfiha de Carne",
      "descricao": "Deliciosa esfiha de carne",
      "preco": 5.5,
      "categoria": "Lanches",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/-1718908522914blob_600.webp"
    },
    {
      "id": 2,
      "nome": "Batata Frita",
      "descricao": "Crocante e deliciosa",
      "preco": 19.99,
      "categoria": "Acompanhamentos",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/202209301410_04F3_i.webp"
    },
    {
      "id": 3,
      "nome": "Pizza Margherita",
      "descricao": "Pizza clássica italiana",
      "preco": 29.99,
      "categoria": "Pizzas",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/-1718908561587blob_600.webp"
    },
    {
      "id": 4,
      "nome": "Bolinha de Calabresa",
      "descricao": "Bolinha de Calabresa",
      "preco": 15.99,
      "categoria": "Salgados",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/-1727402731370blob_600.webp"
    },
    {
      "id": 5,
      "nome": "Calzone Nordestino",
      "descricao": "Calzone Nordestino",
      "preco": 29.99,
      "categoria": "Massas",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/202209301415_5UB0_i.webp"
    },
    {
      "id": 6,
      "nome": "Lasanha",
      "descricao": "Lasanha simples e deliciosa de carne",
      "preco": 24.99,
      "categoria": "Massas",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/202209301412_M92F_i.webp"
    },
    {
      "id": 7,
      "nome": "Coxinha",
      "descricao": "Com molho especial Porção com 12",
      "preco": 15.99,
      "categoria": "Salgados",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/-1727403118487blob_600.webp"
    },
    {
      "id": 8,
      "nome": "Pastel de Queijo",
      "descricao": "Pastel crocante com recheio de queijo",
      "preco": 6.99,
      "categoria": "Salgados",
      "imagem": "https://client-assets.anota.ai/produtos/6667139d3dcef90019f51761/202209301415_MW81_i.webp"
    },
    {
      "id": 9,
      "nome": "Suco de Laranja",
      "descricao": "Suco natural de laranja",
      "preco": 8.99,
      "categoria": "Bebidas",
      "imagem": "https://www.citrosuco.com.br/wp-content/uploads/2022/02/THUMB-05.png"
    },
    {
      "id": 10,
      "nome": "Refrigerante",
      "descricao": "Coca-Cola 350ml",
      "preco": 4.99,
      "categoria": "Bebidas",
      "imagem": "https://client-assets.anota.ai/produtos/6578f378b1b4130012312e45/-1706340780530blob_600.webp"
    },
    {
      "id": 11,
      "nome": "Sanduíche Natural",
      "descricao": "Sanduíche com peito de peru e cream cheese",
      "preco": 12.99,
      "categoria": "Lanches",
      "imagem": "https://placehold.co/1000x1000?text=sanduiche_natural.jpg"
    },
    {
      "id": 12,
      "nome": "Wrap de Frango",
      "descricao": "Wrap de frango grelhado com salada",
      "preco": 14.99,
      "categoria": "Lanches",
      "imagem": "https://placehold.co/1000x1000?text=wrap_frango.jpg"
    },
    {
      "id": 13,
      "nome": "Espaguete à Carbonara",
      "descricao": "Espaguete com molho carbonara",
      "preco": 24.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=espaguete_carbonara.jpg"
    },
    {
      "id": 14,
      "nome": "Macarrão com Queijo",
      "descricao": "Macarrão cremoso com queijo",
      "preco": 19.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=macarrao_queijo.jpg"
    },
    {
      "id": 15,
      "nome": "Taco de Carne",
      "descricao": "Taco recheado com carne e guacamole",
      "preco": 17.99,
      "categoria": "Mexicana",
      "imagem": "https://placehold.co/1000x1000?text=taco_carne.jpg"
    },
    {
      "id": 16,
      "nome": "Burrito Vegetariano",
      "descricao": "Burrito com legumes e feijão",
      "preco": 16.99,
      "categoria": "Mexicana",
      "imagem": "https://placehold.co/1000x1000?text=burrito_vegetariano.jpg"
    },
    {
      "id": 17,
      "nome": "Frango a Parmegiana",
      "descricao": "Peito de frango empanado com molho de tomate",
      "preco": 29.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=frango_parmegiana.jpg"
    },
    {
      "id": 18,
      "nome": "Filé Mignon",
      "descricao": "Filé mignon grelhado com legumes",
      "preco": 39.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=file_mignon.jpg"
    },
    {
      "id": 19,
      "nome": "Peixe Grelhado",
      "descricao": "Peixe grelhado com molho de limão",
      "preco": 34.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=peixe_grelhado.jpg"
    },
    {
      "id": 20,
      "nome": "Salada Caesar",
      "descricao": "Salada com frango grelhado e molho caesar",
      "preco": 21.99,
      "categoria": "Saladas",
      "imagem": "https://placehold.co/1000x1000?text=salada_caesar.jpg"
    },
    {
      "id": 21,
      "nome": "Pudim de Leite",
      "descricao": "Sobremesa clássica de pudim",
      "preco": 8.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=pudim_leite.jpg"
    },
    {
      "id": 22,
      "nome": "Torta de Limão",
      "descricao": "Torta com recheio de limão",
      "preco": 9.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=torta_limao.jpg"
    },
    {
      "id": 23,
      "nome": "Bolo de Chocolate",
      "descricao": "Bolo de chocolate com cobertura",
      "preco": 11.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=bolo_chocolate.jpg"
    },
    {
      "id": 24,
      "nome": "Pavê de Bis",
      "descricao": "Sobremesa de bis em camadas",
      "preco": 10.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=pave_bis.jpg"
    },
    {
      "id": 25,
      "nome": "Creme Brulée",
      "descricao": "Sobremesa francesa com caramelo",
      "preco": 12.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=creme_brulee.jpg"
    },
    {
      "id": 26,
      "nome": "Brownie com Sorvete",
      "descricao": "Brownie quente com sorvete",
      "preco": 14.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=brownie_sorvete.jpg"
    },
    {
      "id": 27,
      "nome": "Milkshake de Morango",
      "descricao": "Milkshake cremoso de morango",
      "preco": 8.99,
      "categoria": "Bebidas",
      "imagem": "https://placehold.co/1000x1000?text=milkshake_morango.jpg"
    },
    {
      "id": 28,
      "nome": "Chá Gelado",
      "descricao": "Chá gelado refrescante",
      "preco": 6.99,
      "categoria": "Bebidas",
      "imagem": "https://placehold.co/1000x1000?text=cha_gelado.jpg"
    },
    {
      "id": 29,
      "nome": "Café Americano",
      "descricao": "Café forte e encorpado",
      "preco": 4.99,
      "categoria": "Bebidas",
      "imagem": "https://placehold.co/1000x1000?text=cafe_americano.jpg"
    },
    {
      "id": 30,
      "nome": "Cappuccino",
      "descricao": "Cappuccino cremoso",
      "preco": 5.99,
      "categoria": "Bebidas",
      "imagem": "https://placehold.co/1000x1000?text=cappuccino.jpg"
    },
    {
      "id": 31,
      "nome": "Tapioca",
      "descricao": "Tapioca com queijo e presunto",
      "preco": 12.99,
      "categoria": "Lanches",
      "imagem": "https://placehold.co/1000x1000?text=tapioca.jpg"
    },
    {
      "id": 32,
      "nome": "Pão de Queijo",
      "descricao": "Pão de queijo quentinho",
      "preco": 8.99,
      "categoria": "Lanches",
      "imagem": "https://placehold.co/1000x1000?text=pao_queijo.jpg"
    },
    {
      "id": 33,
      "nome": "Salada de Frutas",
      "descricao": "Salada fresca de frutas",
      "preco": 9.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=salada_frutas.jpg"
    },
    {
      "id": 34,
      "nome": "Torta de Frutas",
      "descricao": "Torta de frutas da estação",
      "preco": 11.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=torta_frutas.jpg"
    },
    {
      "id": 35,
      "nome": "Sushi",
      "descricao": "Porção de sushi variado",
      "preco": 39.99,
      "categoria": "Japonesa",
      "imagem": "https://placehold.co/1000x1000?text=sushi.jpg"
    },
    {
      "id": 36,
      "nome": "Temaki",
      "descricao": "Temaki de salmão",
      "preco": 15.99,
      "categoria": "Japonesa",
      "imagem": "https://placehold.co/1000x1000?text=temaki.jpg"
    },
    {
      "id": 37,
      "nome": "Yakissoba",
      "descricao": "Yakissoba de carne",
      "preco": 29.99,
      "categoria": "Japonesa",
      "imagem": "https://placehold.co/1000x1000?text=yakissoba.jpg"
    },
    {
      "id": 38,
      "nome": "Risoto de Camarão",
      "descricao": "Risoto cremoso de camarão",
      "preco": 39.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=risoto_camarao.jpg"
    },
    {
      "id": 39,
      "nome": "Risoto de Frango",
      "descricao": "Risoto de frango com ervas",
      "preco": 34.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=risoto_frango.jpg"
    },
    {
      "id": 40,
      "nome": "Feijoada",
      "descricao": "Feijoada completa com arroz",
      "preco": 29.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=feijoada.jpg"
    },
    {
      "id": 41,
      "nome": "Baião de Dois",
      "descricao": "Baião de dois com carne de sol",
      "preco": 27.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=baião_de_dois.jpg"
    },
    {
      "id": 42,
      "nome": "Churrasco",
      "descricao": "Porção de churrasco com farofa",
      "preco": 39.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=churrasco.jpg"
    },
    {
      "id": 43,
      "nome": "Bacalhau à Brás",
      "descricao": "Prato de bacalhau desfiado",
      "preco": 42.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=bacalhau_a_bras.jpg"
    },
    {
      "id": 44,
      "nome": "Polvo Grelhado",
      "descricao": "Polvo grelhado com azeite de oliva",
      "preco": 49.99,
      "categoria": "Pratos Principais",
      "imagem": "https://placehold.co/1000x1000?text=polvo_grelhado.jpg"
    },
    {
      "id": 45,
      "nome": "Risoto de Aspargos",
      "descricao": "Risoto com aspargos frescos",
      "preco": 34.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=risoto_aspargos.jpg"
    },
    {
      "id": 46,
      "nome": "Macarrão ao Pesto",
      "descricao": "Macarrão com molho pesto",
      "preco": 21.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=macarrao_pesto.jpg"
    },
    {
      "id": 47,
      "nome": "Quiche de Alho-Poró",
      "descricao": "Quiche recheada com alho-poró",
      "preco": 22.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=quiche_alho_poro.jpg"
    },
    {
      "id": 48,
      "nome": "Caneloni",
      "descricao": "Caneloni recheado com ricota",
      "preco": 26.99,
      "categoria": "Massas",
      "imagem": "https://placehold.co/1000x1000?text=caneloni.jpg"
    },
    {
      "id": 49,
      "nome": "Sorvete de Baunilha",
      "descricao": "Sorvete cremoso de baunilha",
      "preco": 7.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=sorvete_baunilha.jpg"
    },
    {
      "id": 50,
      "nome": "Bolo de Cenoura",
      "descricao": "Bolo de cenoura com cobertura de chocolate",
      "preco": 9.99,
      "categoria": "Sobremesas",
      "imagem": "https://placehold.co/1000x1000?text=bolo_cenoura.jpg"
    }
  ])
});
