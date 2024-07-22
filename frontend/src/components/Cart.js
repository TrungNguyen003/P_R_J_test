import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cart, setCart] = useState(null); // State for storing cart
  const [loading, setLoading] = useState(true); // State for loading status
  const [checkoutStatus, setCheckoutStatus] = useState(null); // State for checkout status
  const [itemLoading, setItemLoading] = useState({}); // State for item loading status
  const [checkoutLoading, setCheckoutLoading] = useState(false); // State for checkout loading
  const userId = localStorage.getItem("userId"); // Get userId from local storage
  const authToken = localStorage.getItem("authToken"); // Get authToken from local storage
  const navigate = useNavigate(); // Hook for navigation
  axios.defaults.withCredentials = true;
  // Fetch cart data when the component mounts
  useEffect(() => {
    const fetchCart = async () => {
      if (!userId || !authToken) {
        console.error("userId hoặc authToken không được định nghĩa");
        setLoading(false);
        return;
      }
      try {
        console.log(`Đang lấy giỏ hàng cho userId: ${userId}`); // Log userId
        const response = await axios.get(
          `http://localhost:8081/cart/${userId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }, // Send token in header for authentication
          }
        );
        setCart(response.data); // Store cart data in state
      } catch (error) {
        console.error(
          "Lỗi khi lấy giỏ hàng:",
          error.response ? error.response.data : error.message
        );
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchCart(); // Call fetchCart function
  }, [userId, authToken]); // Only call useEffect when userId or authToken changes

  // Function to update item quantity in cart
  const updateItemQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    setItemLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const response = await axios.put(
        `http://localhost:8081/cart/${userId}/items/${itemId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setCart(response.data); // Update cart after changing quantity
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật số lượng sản phẩm:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setItemLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Function to remove item from cart
  const removeItemFromCart = async (itemId) => {
    setItemLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const response = await axios.post(
        "http://localhost:8081/cart/remove",
        { productId: itemId },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setCart(response.data); // Update cart after removing item
    } catch (error) {
      console.error(
        "Lỗi khi xóa sản phẩm khỏi giỏ hàng:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setItemLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

// Function to handle checkout process
const handleCheckout = async () => {
  try {
    setCheckoutLoading(true);
    const response = await axios.post(
      "http://localhost:8081/cart/checkout",
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    setCheckoutStatus("Mua hàng thành công");
    setCart(null); // Clear cart state after successful checkout
    window.location.href = response.data.url; // Redirect to Stripe checkout session
  } catch (error) {
    console.error(
      "Lỗi khi mua hàng:",
      error.response ? error.response.data : error.message
    );
    setCheckoutStatus("Lỗi khi mua hàng");
  } finally {
    setCheckoutLoading(false);
  }
};

  if (loading) {
    return <div>Đang tải...</div>; // Display loading state
  }

  if (!cart) {
    return <div>Không tìm thấy giỏ hàng</div>; // Display message if cart is not found
  }

  return (
    <div>
      <h1>Giỏ hàng</h1>
      <table>
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item._id}>
              <td>
                {item.product.image && (
                  <img
                    src={`http://localhost:8081/product_images/${item.product._id}/${item.product.image}`}
                    alt={item.product.name}
                    style={{ width: "50px", height: "50px" }}
                  />
                )}
              </td>
              <td>{item.product.name}</td>
              <td>
                <button
                  onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                  disabled={itemLoading[item._id]}
                >
                  +
                </button>
                {item.quantity}
                <button
                  onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                  disabled={itemLoading[item._id] || item.quantity <= 1}
                >
                  -
                </button>
              </td>
              <td>${item.price}</td>
              <td>
                <button onClick={() => removeItemFromCart(item.product._id)} disabled={itemLoading[item._id]}>
                  {itemLoading[item._id] ? "Đang xử lý..." : "Xóa"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Tổng giá: ${cart.totalPrice}</h2>
      <button onClick={handleCheckout} disabled={checkoutLoading}>
        {checkoutLoading ? "Đang xử lý..." : "Đặt hàng"}
      </button>
      {checkoutStatus && <p>{checkoutStatus}</p>} 
    </div>
  );
};

export default Cart;
