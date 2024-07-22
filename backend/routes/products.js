const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const fs = require('fs');
const path = require('path');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lấy danh sách tất cả các sản phẩm
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Danh sách các sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Lỗi khi lấy danh sách sản phẩm
 */
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({}).populate('category_id'); // Populate category_id to get category details
    res.json({ products });
  } catch (err) {
    console.error("Error retrieving products:", err);
    res.status(500).json({ error: "Error retrieving products" });
  }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết của một sản phẩm cụ thể
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sản phẩm cần lấy thông tin
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: number
 *                     category_id:
 *                       type: object
 *                       $ref: '#/components/schemas/Category'
 *                     image:
 *                       type: string
 *                     galleryImages:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi khi lấy thông tin sản phẩm
 */
router.get('/product/:id', async (req, res) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    const product = await Product.findById(req.params.id).populate('category_id'); // Populate category_id to get category details

    if (!product) {
      console.log(`Product with ID: ${req.params.id} not found`);
      return res.status(404).json({ message: 'Product not found' });
    }

    const galleryDir = path.join(__dirname, '..', 'public', 'product_images', product._id.toString(), 'gallery');
    let galleryImages = [];

    if (fs.existsSync(galleryDir)) {
      galleryImages = fs.readdirSync(galleryDir);
    }

    res.json({
      product: {
        ...product.toObject(),
        galleryImages,
      }
    });
  } catch (err) {
    console.error(`Error retrieving product with ID: ${req.params.id}`, err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
