const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const OrderDetail = require("../models/orderdetail");
const { isAuthenticated } = require("../middleware/auth");

// Fetch an order by its ID
router.get("/:orderId", isAuthenticated, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id; // Assuming you have user authentication

    // Find the order by its ID and ensure it belongs to the authenticated user
    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Find the order details
    const orderDetails = await OrderDetail.find({ order: orderId }).populate("product");

    res.status(200).json({ order, orderDetails });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ msg: "Error fetching order" });
  }
});

// Fetch all orders for a user
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure the authenticated user is the one requesting their orders
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    // Find all orders for the authenticated user
    const orders = await Order.find({ user: userId }).populate("items.product");

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ msg: "Error fetching user orders" });
  }
});

module.exports = router;
