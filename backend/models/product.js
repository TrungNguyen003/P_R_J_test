const mongoose = require("mongoose");

// Product Schema
const ProductSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    unique: true,
    required: true,
    auto: true,
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId, // Liên kết tới ID của category
    ref: 'Category', // Tham chiếu đến collection Category
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 100, // Giới hạn độ dài của tên sản phẩm
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: mongoose.Types.Decimal128,
    required: true,
    min: 0, // Giá không thể nhỏ hơn 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Số lượng sản phẩm không thể nhỏ hơn 0
  },
  displayImage: {
    type: String,
    maxlength: 255,
  },
  image: {
    type: String,
    maxlength: 255,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
