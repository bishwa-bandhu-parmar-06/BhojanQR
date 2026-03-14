import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Save,
  X,
  UploadCloud,
  FileSpreadsheet,
} from "lucide-react";
import { addMenuItem } from "../../API/menuApi";
import * as XLSX from "xlsx";

const BulkMenuForm = ({ onCancel, onSuccess }) => {
  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      price: "",
      category: "Main Course",
      description: "",
      image: null,
      preview: null,
    },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  
  const fileInputRef = useRef(null);

  const handleChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleImageChange = (id, file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, image: file, preview: previewUrl } : item,
        ),
      );
    }
  };

  const addNewRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        price: "",
        category: "Main Course",
        description: "",
        image: null,
        preview: null,
      },
    ]);
  };

  const removeRow = (id) => {
    if (items.length === 1) return toast.error("You need at least one item.");
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Read the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          return toast.error("The Excel file is empty!");
        }

        // Map Excel columns (handles uppercase/lowercase differences)
        const importedItems = jsonData.map((row, index) => ({
          id: Date.now() + index,
          name: row.Name || row.name || "",
          price: row.Price || row.price || "",
          category: row.Category || row.category || "Main Course",
          description: row.Description || row.description || "",
          image: null,
          preview: row.ImageURL || row["Image URL"] || null,
        }));

        // Replace the default empty row if it's untouched, otherwise append
        setItems((prev) => {
          if (prev.length === 1 && !prev[0].name && !prev[0].price) {
            return importedItems;
          }
          return [...prev, ...importedItems];
        });

        toast.success(
          `Imported ${importedItems.length} items! Please attach your images.`,
        );
      } catch (error) {
        toast.error("Failed to read Excel file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null; // Reset input so the same file can be uploaded again
  };

  const handleBulkSubmit = async () => {
    const invalidItem = items.find(
      (item) => !item.name || !item.price || !item.image,
    );
    if (invalidItem) {
      return toast.error(
        "Please ensure all items have a name, price, and an attached image.",
      );
    }

    setIsUploading(true);
    setProgress(0);
    let successCount = 0;

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const formData = new FormData();

        formData.append("name", item.name);
        formData.append("price", item.price);
        formData.append("category", item.category);
        formData.append("description", item.description);
        formData.append("available", true);
        formData.append("image", item.image);

        await addMenuItem(formData);
        successCount++;
        setProgress(successCount);
      }

      toast.success(`Successfully added ${successCount} menu items!`);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        `Process stopped. Uploaded ${successCount} items before failing.`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            Bulk Add Menu Items
          </h2>
          <p className="text-sm text-gray-500">
            Add rows manually or <strong>import an Excel file</strong> (Columns:
            Name, Price, Category, Description).
          </p>
        </div>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="text-gray-400 hover:text-red-500 disabled:opacity-50"
        >
          <X size={24} />
        </button>
      </div>

      {isUploading && (
        <div className="mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="flex justify-between text-sm font-bold text-orange-600 mb-2">
            <span>Uploading items... Please don't close this window.</span>
            <span>
              {progress} / {items.length} completed
            </span>
          </div>
          <div className="w-full bg-orange-200 rounded-full h-2.5">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress / items.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 items-start"
          >
            <div className="md:col-span-2 relative h-20 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-orange-400 cursor-pointer">
              {item.preview ? (
                <img
                  src={item.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UploadCloud className="text-gray-400" size={24} />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(item.id, e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>

            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Item Name *"
                value={item.name}
                onChange={(e) => handleChange(item.id, "name", e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                disabled={isUploading}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                placeholder="Price *"
                value={item.price}
                onChange={(e) => handleChange(item.id, "price", e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                disabled={isUploading}
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={item.category}
                onChange={(e) =>
                  handleChange(item.id, "category", e.target.value)
                }
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                disabled={isUploading}
              >
                <option value="Main Course">Main Course</option>
                <option value="Starter">Starter</option>
                <option value="Dessert">Dessert</option>
                <option value="Beverage">Beverage</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleChange(item.id, "description", e.target.value)
                }
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-orange-500"
                disabled={isUploading}
              />
            </div>

            <div className="md:col-span-1 flex justify-center mt-2">
              <button
                onClick={() => removeRow(item.id)}
                disabled={isUploading}
                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex gap-3">
          <button
            onClick={addNewRow}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg font-bold text-sm transition-colors"
          >
            <Plus size={18} /> Add Row
          </button>

          {/*  HIDDEN FILE INPUT & IMPORT BUTTON */}
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg font-bold text-sm transition-colors border border-green-200"
          >
            <FileSpreadsheet size={18} /> Import Excel
          </button>
        </div>

        <button
          onClick={handleBulkSubmit}
          disabled={isUploading}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-70 transition-all"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {isUploading ? "Uploading..." : "Upload All"}
        </button>
      </div>
    </div>
  );
};

export default BulkMenuForm;
