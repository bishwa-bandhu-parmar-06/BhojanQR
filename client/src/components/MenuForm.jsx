import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MenuForm = ({ backendUri, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Main Course",
    description: "",
    image: null,
    available: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));

      const response = await axios.post(`${backendUri}/api/menu/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      onSuccess(response.data.menuItem); // Update parent
      toast.success("Item added successfully!");
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 p-6 rounded-xl shadow-xl bg-gradient-to-r from-green-100 via-white to-green-300"
    >
      <h2 className="text-2xl font-bold text-green-800 mb-4 drop-shadow-lg">
        Add New Menu Item
      </h2>
      <input
        type="text"
        name="name"
        placeholder="Item Name"
        value={formData.name}
        onChange={handleChange}
        className="w-full mb-3 p-3 rounded-lg border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Price"
        value={formData.price}
        onChange={handleChange}
        className="w-full mb-3 p-3 rounded-lg border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
        required
      />
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        className="w-full mb-3 p-3 rounded-lg border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option>Main Course</option>
        <option>Starter</option>
        <option>Dessert</option>
        <option>Beverage</option>
      </select>
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full mb-3 p-3 rounded-lg border border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="w-full mb-3 p-3 rounded-lg border border-orange-500"
        required
      />
      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          name="available"
          checked={formData.available}
          onChange={handleChange}
          className="text-green-500"
        />
        <span className="text-gray-600">Available</span>
      </label>
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition duration-300"
        >
          Add Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MenuForm;
