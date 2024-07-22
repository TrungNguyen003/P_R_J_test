import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Success = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchOrder = async () => {
      const params = new URLSearchParams(location.search);
      const orderId = params.get('orderId');

      if (!orderId) {
        console.error("Order ID is not defined");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8081/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        });
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching order:", error.response ? error.response.data : error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [location.search]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  return (
    <div>
      <h1>Order Success</h1>
      <p>Thank you for your purchase! Your order details are below:</p>
      <div>
        <h2>Order ID: {order.order._id}</h2>
        <h3>Order Total: ${order.order.total}</h3>
        <h4>Status: {order.order.status}</h4>
        <ul>
          {order.orderDetails.map(detail => (
            <li key={detail._id}>
              <p>Product: {detail.product.name}</p>
              <p>Quantity: {detail.quantity}</p>
              <p>Price: ${detail.price}</p>
              <img src={`http://localhost:8081/product_images/${detail.product._id}/${detail.product.image}`} alt={detail.product.name} style={{ width: "50px", height: "50px" }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Success;
