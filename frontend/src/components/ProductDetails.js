import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/product/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const authToken = localStorage.getItem('authToken'); // Lấy authToken từ localStorage
      if (!authToken) {
        setError('Bạn cần đăng nhập trước'); // Xử lý trường hợp chưa đăng nhập
        return;
      }

      const res = await axios.post(
        'http://localhost:8081/cart/add',
        { productId: product._id, quantity },
        {
          headers: {
            Authorization: `Bearer ${authToken}` // Thêm token vào header Authorization
          },
          withCredentials: true
        }
      );
      console.log('Đã thêm vào giỏ hàng:', res.data);
      // Xử lý khi thêm vào giỏ hàng thành công

    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      if (err.response) {
        setError(err.response.data.msg); // Hiển thị thông báo lỗi từ server nếu có
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.'); // Xử lý lỗi không có phản hồi từ server
      }
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!product) {
    return <div>Không tìm thấy sản phẩm.</div>;
  }

  return (
    <div>
      <h2>Chi tiết sản phẩm</h2>
      {product.image && (
        <img
          src={`http://localhost:8081/product_images/${product._id}/${product.image}`}
          alt={product.title}
          className="product-image"
        />
      )}
      <h3>{product.title}</h3>
      <p>Danh mục: {product.category_id.name}</p>
      <p>Giá: {product.price.$numberDecimal} VND</p>
      <h3>Thư viện hình ảnh sản phẩm</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {product.galleryImages.length > 0 ? (
          product.galleryImages.map((image, index) => (
            <img
              key={index}
              src={`http://localhost:8081/product_images/${product._id}/gallery/${image}`}
              alt={``}
              style={{ height: '200px', margin: '10px' }}
            />
          ))
        ) : (
          <p>Không có hình ảnh trong thư viện</p>
        )}
      </div>

      <div>
        <label>Số lượng:</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </div>
  );
};

export default ProductDetails;
