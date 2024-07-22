const express = require("express");
const router = express.Router();
const Category = require("../models/category");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API for managing categories
 */

/**
 * @swagger
 * /admin/categories:
 *   get:
 *     summary: Lấy danh sách các danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng danh mục trên mỗi trang
 *     responses:
 *       200:
 *         description: Một danh sách các danh mục
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const categories = await Category.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    const totalCategories = await Category.countDocuments();

    res.json({
      categories,
      totalPages: Math.ceil(totalCategories / pageSize),
      currentPage: page
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /admin/categories/add-category:
 *   post:
 *     summary: Thêm một danh mục mới
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Category_ID:
 *                 type: number
 *               Name:
 *                 type: string
 *               Description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đã thêm danh mục thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: ID danh mục và tên là bắt buộc
 *       500:
 *         description: Server Error
 */
router.post("/add-category", async (req, res) => {
  try {
    const { Category_ID, Name, Description } = req.body;

    // Validate input
    if (!Category_ID || !Name) {
      return res
        .status(400)
        .json({ message: "ID danh mục và tên là bắt buộc" });
    }

    const newCategory = new Category({
      Category_ID,
      Name,
      Description,
    });

    await newCategory.save();
    res
      .status(201)
      .json({ message: "Đã thêm danh mục thành công", category: newCategory });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /admin/categories/edit-category/{id}:
 *   put:
 *     summary: Chỉnh sửa một danh mục hiện có
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cần chỉnh sửa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Danh mục được cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Tên là bắt buộc
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Server Error
 */
router.put("/edit-category/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Description } = req.body;

    // Validate input
    if (!Name) {
      return res.status(400).json({ message: "Tên là bắt buộc" });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { Name, Description, Updated_At: Date.now() },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({
      message: "Danh mục được cập nhật thành công",
      category: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

/**
 * @swagger
 * /admin/categories/delete-category/{id}:
 *   delete:
 *     summary: Xóa một danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của danh mục cần xóa
 *     responses:
 *       200:
 *         description: Đã xóa danh mục thành công
 *       404:
 *         description: Không tìm thấy danh mục
 *       500:
 *         description: Server Error
 */
router.delete("/delete-category/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({ message: "Đã xóa danh mục thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
