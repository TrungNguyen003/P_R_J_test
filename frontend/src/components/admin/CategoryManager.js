import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ Category_ID: "", Name: "", Description: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/admin/categories?page=${currentPage}&pageSize=${pageSize}`);
        setCategories(response.data.categories);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching categories", error);
        setMessage("Failed to load categories");
      }
    };

    fetchCategories();
  }, [currentPage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      try {
        const response = await axios.put(`http://localhost:8081/admin/categories/edit-category/${currentId}`, form);
        setMessage(response.data.message);
        setCategories(categories.map(cat => (cat._id === currentId ? response.data.category : cat)));
        setEditMode(false);
        setCurrentId(null);
        setForm({ Category_ID: "", Name: "", Description: "" });
      } catch (error) {
        console.error("Error updating category", error);
        setMessage("Failed to update category");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:8081/admin/categories/add-category", form);
        setMessage(response.data.message);
        setCategories([...categories, response.data.category]);
        setForm({ Category_ID: "", Name: "", Description: "" });
      } catch (error) {
        console.error("Error adding category", error);
        setMessage("Failed to add category");
      }
    }
  };

  const handleEdit = (category) => {
    setForm({ Category_ID: category.Category_ID, Name: category.Name, Description: category.Description });
    setEditMode(true);
    setCurrentId(category._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8081/admin/categories/delete-category/${id}`);
      setMessage(response.data.message);
      setCategories(categories.filter(category => category._id !== id));
    } catch (error) {
      console.error("Error deleting category", error);
      setMessage("Failed to delete category");
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <h2>Category Manager</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category ID</label>
          <input type="text" name="Category_ID" value={form.Category_ID} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Name</label>
          <input type="text" name="Name" value={form.Name} onChange={handleInputChange} required />
        </div>
        <div>
          <label>Description</label>
          <textarea name="Description" value={form.Description} onChange={handleInputChange} required></textarea>
        </div>
        <button type="submit">{editMode ? "Update" : "Add"} Category</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category._id}>
              <td>{category.Category_ID}</td>
              <td>{category.Name}</td>
              <td>{category.Description}</td>
              <td>
                <button onClick={() => handleEdit(category)}>Edit</button>
                <button onClick={() => handleDelete(category._id)}>Delete</button>
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

export default CategoryManager;
