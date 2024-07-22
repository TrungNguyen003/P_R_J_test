import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "../assets/style.css";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10); // You can change the number of products per page here
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8081/admin/products', {
          params: {
            page: currentPage,
            limit: productsPerPage,
          },
        });
        setProducts(response.data.products);
        setCount(response.data.count);
      } catch (error) {
        console.error('Error fetching products', error);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handleDelete = async (productId) => {
    try {
      await axios.get(`http://localhost:8081/admin/products/delete-product/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  const totalPages = Math.ceil(count / productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h2>Product List</h2>
      <Link to="/admin/products/add">Add Product </Link>
      <p>Total Products: {count}</p>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.$numberDecimal}</td>
              <td>
                {product.image && (
                  <img
                    src={`http://localhost:8081/product_images/${product._id}/${product.image}`}
                    alt={product.name}
                    className="product-image"
                    style={{ width: '100px', height: 'auto' }} // Adjust image size as needed
                  />
                )}
              </td>
              <td>
                <button onClick={() => navigate(`/admin/products/edit-product/${product._id}`)}>Edit</button>
                <button onClick={() => handleDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductList;
