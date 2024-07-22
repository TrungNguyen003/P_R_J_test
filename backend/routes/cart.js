const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderDetail = require("../models/orderdetail");
const { isAuthenticated } = require("../middleware/auth");
const mongoose = require("mongoose");
const Payment = require("../models/payment");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body; // Lấy productId và quantity từ request body
    const userId = req.user._id; // Lấy userId từ đối tượng user đã được xác thực
    let cart = await Cart.findOne({ user: userId }); // Tìm giỏ hàng của người dùng
    if (!cart) {
      cart = new Cart({ user: userId, items: [] }); // Nếu chưa có giỏ hàng, tạo mới
    }

    // Kiểm tra xem productId có phải là ObjectId hợp lệ hay không
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ msg: "Id sản phẩm không hợp lệ" });
    }

    const productObjectId = mongoose.Types.ObjectId(productId); // Chuyển productId thành ObjectId
    const product = await Product.findById(productObjectId); // Tìm sản phẩm theo Id

    if (!product) {
      return res.status(404).json({ msg: "Sản phẩm không có" }); // Nếu không tìm thấy sản phẩm
    }

    // Tìm sản phẩm trong giỏ hàng nếu đã tồn tại
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity; // Nếu sản phẩm đã có, cập nhật số lượng
    } else {
      cart.items.push({
        product: productObjectId,
        quantity,
        price: product.price,
      }); // Nếu chưa có, thêm mới
    }

    // Tính tổng giá trị của giỏ hàng
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save(); // Lưu giỏ hàng
    const populatedCart = await cart.populate("items.product").execPopulate(); // Lấy thông tin chi tiết sản phẩm
    res.status(200).json(populatedCart); // Trả về giỏ hàng đã cập nhật
  } catch (err) {
    console.error("Lỗi thêm sản phẩm vào giỏ hàng:", err);
    res.status(500).json({ msg: "Lỗi thêm sản phẩm vào giỏ hàng" }); // Trả về lỗi nếu có
  }
});

// Xoá sản phẩm khỏi giỏ hàng
router.post("/remove", isAuthenticated, async (req, res) => {
  const { productId } = req.body; // Lấy productId từ request body

  try {
    let cart = await Cart.findOne({ user: req.user._id }); // Tìm giỏ hàng của người dùng

    if (!cart) {
      return res.status(404).json({ msg: "Không tìm thấy giỏ hàng" }); // Nếu không tìm thấy giỏ hàng
    }
    // Loại bỏ sản phẩm khỏi giỏ hàng
    cart.items = cart.items.filter((item) => !item.product.equals(productId));
    // Tính lại tổng giá trị của giỏ hàng
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save(); // Lưu giỏ hàng
    const populatedCart = await cart.populate("items.product").execPopulate(); // Lấy thông tin chi tiết sản phẩm
    res.status(200).json(populatedCart); // Trả về giỏ hàng đã cập nhật
  } catch (err) {
    console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", err);
    res.status(500).json({ error: "Lỗi xóa sản phẩm khỏi giỏ hàng" }); // Trả về lỗi nếu có
  }
});

// Lấy giỏ hàng của người dùng
router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Đang tìm nạp giỏ hàng cho người dùng: ${userId}`); // Add logging here
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
      console.log("Không tìm thấy giỏ hàng cho người dùng:", userId);
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
    res.json(cart);
  } catch (error) {
    console.error("Lỗi tìm nạp giỏ hàng cho người dùng:", userId, error); // Add logging here
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/:userId/items/:itemId", isAuthenticated, async (req, res) => {
  try {
    const { userId, itemId } = req.params; // Lấy userId và itemId từ URL parameters
    const { quantity } = req.body; // Lấy số lượng từ request body
    const cart = await Cart.findOne({ user: userId }); // Tìm giỏ hàng của người dùng

    if (!cart) {
      return res.status(404).json({ msg: "Không tìm thấy giỏ hàng" }); // Trả về lỗi nếu không tìm thấy giỏ hàng
    }

    // Tìm sản phẩm trong giỏ hàng theo itemId
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy mặt hàng trong giỏ hàng" }); // Trả về lỗi nếu không tìm thấy sản phẩm
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1); // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
    } else {
      cart.items[itemIndex].quantity = quantity; // Cập nhật số lượng sản phẩm
    }

    // Tính lại tổng giá trị của giỏ hàng
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save(); // Lưu giỏ hàng
    const populatedCart = await cart.populate("items.product").execPopulate(); // Lấy thông tin chi tiết sản phẩm
    res.status(200).json(populatedCart); // Trả về giỏ hàng đã cập nhật
  } catch (err) {
    console.error("Lỗi cập nhật số lượng mặt hàng:", err);
    res.status(500).json({ msg: "Lỗi cập nhật số lượng mặt hàng" }); // Trả về lỗi nếu có
  }
});


// Mua hàng từ giỏ hàng
router.post("/checkout", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Giỏ hàng của bạn trống" });
    }

    const order = new Order({
      user: userId,
      total: cart.totalPrice,
      status: "pending",
    });
    await order.save();

    for (const item of cart.items) {
      const orderDetail = new OrderDetail({
        order: order._id,
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
      });
      await orderDetail.save();
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            description: item.product.description,
            images: [`http://localhost:8081/product_images/${item.product._id}/${item.product.image}`],
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `http://localhost:3000/success?orderId=${order._id}`,
      cancel_url: 'http://localhost:8081/cart/checkout/cancel',
      metadata: { orderId: order._id.toString() },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Lỗi thanh toán:", err);
    res.status(500).json({ msg: "Lỗi thanh toán" });
  }
});

// Xử lý khi thanh toán thành công
router.get("/checkout/success", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.query;
    const userId = req.user._id;

    console.log("Nhận được callback thanh toán thành công với orderId:", orderId, "và userId:", userId);

    const order = await Order.findOneAndUpdate(
      { _id: orderId, user: userId },
      { status: "completed" },
      { new: true }
    );

    if (!order) {
      console.log("Không tìm thấy đơn hàng với orderId:", orderId);
      return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    }

    console.log("Đã cập nhật trạng thái đơn hàng thành 'completed'.");

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
      console.log("Đã xóa giỏ hàng cho userId:", userId);
    } else {
      console.log("Không tìm thấy giỏ hàng cho userId:", userId);
    }

    res.redirect(`http://localhost:3000/success?orderId=${order._id}`);
  } catch (err) {
    console.error("Lỗi khi xử lý thanh toán thành công:", err);
    res.status(500).json({ msg: "Lỗi khi xử lý thanh toán thành công" });
  }
});




module.exports = router;
