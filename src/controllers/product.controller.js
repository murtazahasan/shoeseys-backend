import Product from "../models/product.model.js";

// Add a new product
export const addProduct = async (req, res) => {
  console.log("Request received at product.controllers: addProduct");
  const {
    name,
    description,
    price,
    discountPrice,
    discountPercentage,
    category,
    stock,
    imageUrl,
    quantity,
  } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      discountPrice,
      discountPercentage,
      category,
      imageUrl,
      stock,
      quantity,
    });

    await newProduct.save();
    console.log("Product added successfully:", newProduct._id);
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  console.log("Request received at product.controllers: getProductById");
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product fetched successfully:", productId);
    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({
      message: "Error fetching product details",
      error: error.message,
    });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  console.log("Request received at product.controllers: updateProduct");
  const productId = req.params.id;
  const updatedData = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true }
    );
    if (!updatedProduct) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product updated successfully:", productId);
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  console.log("Request received at product.controllers: deleteProduct");
  const productId = req.params.id;

  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("Product deleted successfully:", productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

// Searching functionality for frontend UI/UX
export const searchProducts = async (req, res) => {
  console.log("Request received at product.controllers: searchProducts");
  const { query } = req.query;

  try {
    if (!query) {
      console.log("Query parameter is required");
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const searchRegex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [{ name: searchRegex }, { description: searchRegex }],
      category: { $nin: ["best-selling", "featured-product"] },
    }).select("name description imageUrl");

    console.log("Products found:", products.length);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res
      .status(500)
      .json({ message: "Error searching products", error: error.message });
  }
};

// Searching functionality for admin page
export const getAllProducts = async (req, res) => {
  console.log("Request received at product.controllers: getAllProducts");
  const { page = 1, limit = 10, search = "", category = "" } = req.query;

  try {
    const query = {};
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    console.log("Products fetched successfully");
    res.status(200).json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res
      .status(500)
      .json({ message: "Error retrieving products", error: error.message });
  }
};
