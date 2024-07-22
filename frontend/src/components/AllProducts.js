import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./assets/style.css";

const AllProduct = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/products")
      .then((res) => {
        setProducts(res.data.products);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy sản phẩm:", err);
      });
  }, []);

  return (
    <div>
      <h2>Tất cả sản phẩm</h2>
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Giá: {product.price.$numberDecimal} VND</p>
            {product.image && (
              <img
                src={`http://localhost:8081/product_images/${product._id}/${product.image}`}
                alt={product.name}
                className="product-image"
              />
            )}
            {/* Thêm nút "Xem chi tiết" */}
            <Link to={`/products/${product._id}`}>Xem chi tiết</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllProduct;
