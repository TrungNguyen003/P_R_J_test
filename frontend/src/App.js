import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import AllProducts from './components/AllProducts';
import Header from './components/layout/Header';
import Login from './components/Logins';
import Register from './components/Register';
import ProductDetail from './components/admin/ProductDetail';
import ProductDetails from './components/ProductDetails';
import ProductsList from './components/admin/ProductsList';
import EditProduct from './components/admin/EditProduct';
import AddProduct from './components/admin/AddProduct';
import UserManagement from './components/admin/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './components/Cart';
import CategoryManager from "./components/admin/CategoryManager";

import Success from './components/Success'; 
import AdminRoute from "./components/AdminRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get('http://localhost:8081/users/check-auth', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUser(res.data.user);
          console.log(`User is authenticated. Role: ${res.data.user.role}`);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('role');
        }
      } catch (err) {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        console.log('User is not authenticated.');
      }
    };
  
    checkAuth();
  }, []);

  return (
    <>
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<AllProducts />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin/products" element={<ProductsList />} />
          <Route path="/admin/categories" element={<CategoryManager />} />
          <Route path="/admin/product-detail/:id" element={<ProductDetail />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
          <Route path="/admin/products/edit-product/:id" element={<EditProduct />} />
          <Route path="/admin/users" element={<UserManagement/>}/>
        </Route>
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
  
        <Route path="/success" element={<Success />} />
      </Routes>
    </>
  );
}

export default App;
