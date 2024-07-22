const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

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
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /users/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /users/register:
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
          role,
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

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
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
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid login credentials
 *       500:
 *         description: Server error
 */
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ msg: "Thông tin đăng nhập không hợp lệ" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.session.user = user;
      const token = jwt.sign({ id: user._id, role: user.role }, "0308", {
        expiresIn: "1h",
      });
      console.log(
        `Người dùng ${user.username} đã đăng nhập. Vai trò: ${user.role}`
      );
      res.json({
        msg: "Đăng nhập thành công",
        userId: user._id,
        token,
        role: user.role,
      });
    });
  })(req, res, next);
});

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: User logout
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.get("/logout", (req, res) => {
  req.logout(); // Đăng xuất người dùng
  req.session.destroy(); // Hủy phiên người dùng
  res.status(200).json({ msg: "Đăng xuất thành công" }); // Phản hồi khi đăng xuất thành công
});

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check user authentication
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isAuthenticated:
 *                   type: boolean
 *                   description: Authentication status
 *                 role:
 *                   type: string
 *                   description: User role
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.get("/check-auth", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.json({ isAuthenticated: false });
  }

  const token = authHeader.split(" ")[1]; // Trích xuất token
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  jwt.verify(token, "0308", (err, decoded) => {
    if (err) {
      return res.json({ isAuthenticated: false });
    }
    User.findById(decoded.id, (err, user) => {
      if (err || !user) {
        return res.json({ isAuthenticated: false });
      }
      res.json({ isAuthenticated: true, role: user.role, user });
    });
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
