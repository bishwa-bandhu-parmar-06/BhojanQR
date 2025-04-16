const MenuItem = require("../models/Menu");

// ➕ Add menu item
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const imageUrl = req.file?.path;

    if (!name || !price || !category || !imageUrl) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newItem = new MenuItem({
      name,
      price,
      category,
      description,
      imageUrl,
    });
    await newItem.save();

    res.status(201).json({ message: "Menu item added", data: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
};

// 📃 Get all items with Pagination + Search
exports.getAllMenuItems = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = {
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const items = await MenuItem.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
      items,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error });
  }
};

// 🔍 Get single item
// 🔍 Get single item
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item || item.isDeleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json({ item }); // ✅ Corrected line here
  } catch (error) {
    res.status(500).json({ message: "Error fetching item", error });
  }
};

// ✏️ Update item
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, available } = req.body;

    const updatedData = {};

    if (name !== undefined) updatedData.name = name;
    if (price !== undefined) updatedData.price = price;
    if (category !== undefined) updatedData.category = category;
    if (description !== undefined) updatedData.description = description;
    if (available !== undefined) updatedData.available = available;
    if (req.file?.path) updatedData.imageUrl = req.file.path;

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedItem || updatedItem.isDeleted) {
      return res.status(404).json({ message: "Item not found or deleted" });
    }

    res.status(200).json({ message: "Item updated", data: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error updating item", error });
  }
};

// 🗑️ Soft delete
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted (soft)" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
};

// ✅ Toggle availability
exports.updateMenuAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    if (!updatedItem || updatedItem.isDeleted) {
      return res.status(404).json({ message: "Item not found or deleted" });
    }

    res
      .status(200)
      .json({ message: "Availability updated", data: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Failed to update availability", error });
  }
};
