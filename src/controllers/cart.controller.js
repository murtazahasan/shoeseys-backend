import mongoose from "mongoose";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// Adds a product to the user's cart.
export const addToCart = async (req, res) => {
  console.log("Request received at cart.controllers: addToCart");
  const userId = req._id;
  const { productId, quantity } = req.body;

  console.log("User ID:", userId);
  console.log("Product ID:", productId);
  console.log("Quantity:", quantity);

  if (!productId || !quantity) {
    return res
      .status(400)
      .json({ message: "Product ID and quantity are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      return res.status(404).json({ message: "Product not found" });
    }

    const cartItem = user.cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.items.push({ product: productId, quantity });
    }

    await user.save();
    console.log("Item added to cart:", user.cart);
    res
      .status(200)
      .json({ message: "Item added to cart", cart: user.cart.items });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: error.message });
  }
};

// Updates the quantity of a product in the user's cart.
export const updateCartItem = async (req, res) => {
  console.log("Request received at cart.controllers: updateCartItem");
  const userId = req._id;
  const { productId, quantity } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    const cartItem = user.cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) {
      console.log("Item not found in cart:", productId);
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();
    console.log("Cart updated:", user.cart);
    res.status(200).json({ message: "Cart updated", cart: user.cart.items });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Removes a product from the user's cart.
export const removeFromCart = async (req, res) => {
  console.log("Request received at cart.controllers: removeFromCart");
  const userId = req._id;
  const { productId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.items = user.cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await user.save();
    console.log("Item removed from cart:", user.cart);
    res
      .status(200)
      .json({ message: "Item removed from cart", cart: user.cart.items });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: error.message });
  }
};

// Removes all product from user's cart
export const clearCart = async (req, res) => {
  console.log("Request received at cart.controllers: clearCart");
  const userId = req._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    user.cart.items = [];
    await user.save();
    console.log("Cart cleared:", user.cart);
    res.status(200).json({ message: "Cart cleared", cart: user.cart.items });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: error.message });
  }
};

// Retrieves the user's cart items.
// export const getCart = async (req, res) => {
//   console.log("Request received at cart.controllers: getCart");
//   const userId = req._id;

//   try {
//     const user = await User.findById(userId).populate("cart.items.product");
//     if (!user) {
//       console.log("User not found:", userId);
//       return res.status(404).json({ message: "User not found" });
//     }

//     console.log("Cart fetched successfully:", user.cart);
//     res.status(200).json(user.cart.items);
//   } catch (error) {
//     console.error("Error getting cart:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
