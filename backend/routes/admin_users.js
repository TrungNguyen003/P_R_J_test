const User = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

/**
 * @swagger
 * tags:
 *   name: Admin_Users
 *   description: Admin Users
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin_Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

  
  /**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin_Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });


  // Hàm tạo `user_id` tự động
async function generateUniqueUserId() {
    let userId;
    let user;
    do {
      userId = Math.floor(Math.random() * 1000000); // Tạo số ngẫu nhiên từ 0 đến 999999
      user = await User.findOne({ user_id: userId });
    } while (user);
    return userId;
  }
  
  /**
   * @swagger
   * /admin/users/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Users]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username
   *               password:
   *                 type: string
   *                 description: Password
   *               password2:
   *                 type: string
   *                 description: Confirm Password
   *               role:
   *                 type: string
   *                 description: User role
   *             required:
   *               - username
   *               - password
   *               - password2
   *               - role
   *     responses:
   *       201:
   *         description: Registration successful
   *       400:
   *         description: Validation errors
   *       500:
   *         description: Server error
   */
  router.post(
    "/register",
    [
      check("username", "Tên đăng nhập là bắt buộc").notEmpty(),
      check("password", "Mật khẩu là bắt buộc").notEmpty(),
      check("password2", "Xác nhận mật khẩu là bắt buộc").notEmpty(),
      check("role", "Vai trò là bắt buộc").notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      const { username, password, password2, role } = req.body;
  
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      if (password !== password2) {
        return res
          .status(400)
          .json({ errors: [{ param: "password2", msg: "Mật khẩu không khớp" }] });
      }
  
      User.findOne({ username }).then(async (user) => {
        if (user) {
          return res.status(400).json({ msg: "Tên đăng nhập đã tồn tại" });
        } else {
          const userId = await generateUniqueUserId();
          const newUser = new User({
            user_id: userId,
            username,
            password,
            role
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ msg: "Lỗi máy chủ" });
            }
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ msg: "Lỗi máy chủ" });
              }
              newUser.password = hash;
              newUser
                .save()
                .then(() => res.status(201).json({ msg: "Đăng ký thành công" }))
                .catch((err) => {
                  console.error(err);
                  return res.status(500).json({ msg: "Lỗi máy chủ" });
                });
            });
          });
        }
      });
    }
  );
  



  
  module.exports = router;