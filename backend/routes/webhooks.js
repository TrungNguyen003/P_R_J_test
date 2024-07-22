const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const Cart = require("../models/cart");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");

// Middleware to handle raw body from Stripe
// Middleware to handle raw body from Stripe
router.post(
  "/stripe",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const userId = session.metadata.userId;

        try {
          const order = await Order.findByIdAndUpdate(
            orderId,
            { status: "completed" },
            { new: true }
          );

          if (order) {
            const cart = await Cart.findOne({ user: userId });
            if (cart) {
              cart.items = [];
              cart.totalPrice = 0;
              await cart.save();
              console.log("Đã xóa giỏ hàng cho userId:", userId);
            }
          }
        } catch (error) {
          console.error("Error updating order or clearing cart:", error);
          return res.status(500).send("Server Error");
        }

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  }
);


module.exports = router;
