const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");
const mongoose = require("mongoose");
const Product = require("../models/product");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

/**
 * @swagger
 * tags:
 *   name: Admin Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /admin/products:
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const count = await Product.countDocuments();
    const products = await Product.find()
      .populate("category_id")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ products, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


/**
 * @swagger
 * /admin/products/add-product:
 *   post:
 *     summary: Add a new product
 *     tags: [Admin Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               category_id:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/add-product",
  [
    body("name").notEmpty().withMessage("Tiêu đề phải có giá trị."),
    body("description").notEmpty().withMessage("Mô tả phải có giá trị."),
    body("price").isDecimal().withMessage("Giá phải có giá trị."),
    body("image").custom((value, { req }) => {
      if (!req.files || !req.files.image) {
        throw new Error("Bạn phải tải lên một hình ảnh");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const categories = await Category.find();
        return res.status(400).json({ errors: errors.array(), categories });
      }

      const imageFile = req.files.image ? req.files.image.name : "";
      const { name, description, price, category_id, stock } = req.body;

      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({ message: "Category not found" });
      }

      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        const categories = await Category.find();
        return res.status(400).json({
          message: "Tên sản phẩm đã tồn tại, chọn tên khác.",
          categories,
        });
      }

      const product = new Product({
        product_id: new mongoose.Types.ObjectId(),
        category_id,
        name,
        description,
        price: mongoose.Types.Decimal128.fromString(price),
        stock,
        image: imageFile,
      });

      await product.save();

      mkdirp.sync(`public/product_images/${product._id}`);
      mkdirp.sync(`public/product_images/${product._id}/gallery`);
      mkdirp.sync(`public/product_images/${product._id}/gallery/thumbs`);

      if (imageFile) {
        const productImage = req.files.image;
        const path = `public/product_images/${product._id}/${imageFile}`;
        productImage.mv(path, (err) => {
          if (err) return console.error(err);
        });
      }

      res.status(200).json({ message: "Product added successfully!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

/**
 * @swagger
 * /admin/products/edit-product/{id}:
 *   get:
 *     summary: Get product details for editing
 *     tags: [Admin Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/edit-product/:id", async (req, res) => {
  try {
    const categories = await Category.find({}, "_id Name"); // Chỉ lấy _id và name của danh mục
    const product = await Product.findById(req.params.id).populate(
      "category_id"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const galleryDir = `public/product_images/${product._id}/gallery`;
    let galleryImages = [];

    if (fs.existsSync(galleryDir)) {
      galleryImages = fs.readdirSync(galleryDir);
    }

    res.json({
      product: {
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        category_id: product.category_id ? product.category_id._id : "",
        price: product.price ? product.price.toString() : "",
        stock: product.stock,
        image: product.image,
        galleryImages,
        id: product._id,
      },
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * @swagger
 * /admin/products/edit-product/{id}:
 *   post:
 *     summary: Edit product
 *     tags: [Admin Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               category_id:
 *                 type: string
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product edited successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post(
  "/edit-product/:id",
  [
    body("name").notEmpty().withMessage("Tiêu đề phải có giá trị."),
    body("description").notEmpty().withMessage("Mô tả phải có giá trị."),
    body("price").isDecimal().withMessage("Giá phải có giá trị."),
  ],
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.errors = errors;
      return res.redirect(`/admin/products/edit-product/${id}`);
    }

    try {
      const imageFile =
        req.files && req.files.image ? req.files.image.name : "";

      const { name, description, price, category_id, stock, pimage } = req.body;

      const existingProduct = await Product.findOne({ name, _id: { $ne: id } });
      if (existingProduct) {
        req.flash("danger", "Tên sản phẩm đã tồn tại, chọn tên khác.");
        return res.redirect(`/admin/products/edit-product/${id}`);
      }

      const product = await Product.findById(id);
      if (!product) {
        req.flash("danger", "Product not found");
        return res.redirect("/admin/products");
      }

      const category = await Category.findById(category_id);
      if (!category) {
        req.flash("danger", "Category not found");
        return res.redirect(`/admin/products/edit-product/${id}`);
      }

      product.name = name;
      product.description = description;
      product.price = mongoose.Types.Decimal128.fromString(price);
      product.category_id = category_id;
      product.stock = stock;
      if (imageFile) {
        product.image = imageFile;
      }

      await product.save();

      if (imageFile) {
        if (pimage) {
          await fs.remove(`public/product_images/${id}/${pimage}`);
        }

        const productImage = req.files.image;
        const path = `public/product_images/${id}/${imageFile}`;
        await productImage.mv(path);
      }

      req.flash("success", "Sản phẩm đã được chỉnh sửa!");
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.flash("danger", "Server error");
      res.redirect(`/admin/products/edit-product/${id}`);
    }
  }
);

/**
 * @swagger
 * /admin/products/delete-product/{id}:
 *   get:
 *     summary: Delete product
 *     tags: [Admin Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       500:
 *         description: Server error
 */
router.get("/delete-product/:id", function (req, res) {
  const id = req.params.id;
  const path = "public/product_images/" + id;

  fs.remove(path, function (err) {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Sản phẩm đã bị xóa!");
          res.redirect("/admin/products");
        }
      });
    }
  });
});

/**
 * @swagger
 * /admin/products/product-gallery/{id}:
 *   post:
 *     summary: Upload product gallery images
 *     tags: [Admin Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/product-gallery/:id", function (req, res) {
  const productImages = req.files.images; // Expect an array of files
  const id = req.params.id;

  if (!Array.isArray(productImages)) {
    return res.status(400).json({ message: "No images uploaded" });
  }

  productImages.forEach((image) => {
    const path = `public/product_images/${id}/gallery/${image.name}`;
    const thumbsPath = `public/product_images/${id}/gallery/thumbs/${image.name}`;

    image.mv(path, function (err) {
      if (err) {
        return console.log(err);
      }

      resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(
        function (buf) {
          fs.writeFileSync(thumbsPath, buf);
        }
      );
    });
  });

  res.sendStatus(200);
});

/**
 * @swagger
 * /admin/products/delete-image/{image}:
 *   get:
 *     summary: Delete product image
 *     tags: [Admin Products]
 *     parameters:
 *       - in: path
 *         name: image
 *         schema:
 *           type: string
 *         required: true
 *         description: Image name
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       500:
 *         description: Server error
 */
router.get("/delete-image/:image", function (req, res) {
  const originalImage =
    "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
  const thumbImage =
    "public/product_images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fs.remove(originalImage, function (err) {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Đã xóa hình ảnh!");
          res.redirect("/admin/products/edit-product/" + req.query.id);
        }
      });
    }
  });
});

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - product_id
 *         - category_id
 *         - name
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         product_id:
 *           type: string
 *           description: The auto-generated ID of the product
 *         category_id:
 *           type: string
 *           description: Category ID the product belongs to
 *         name:
 *           type: string
 *           description: Name of the product
 *         description:
 *           type: string
 *           description: Description of the product
 *         price:
 *           type: string
 *           format: decimal
 *           description: Price of the product
 *         stock:
 *           type: integer
 *           description: Stock quantity of the product
 *         displayImage:
 *           type: string
 *           description: Display image URL of the product
 *         image:
 *           type: string
 *           description: Image URL of the product
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the product was added
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: The date the product was last updated
 */
