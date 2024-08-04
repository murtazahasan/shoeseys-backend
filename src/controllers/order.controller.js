import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// create new orders
export const createOrder = async (req, res) => {
  console.log("Request received at order.controllers: createOrder");

  const { userId, items, shippingAddress, totalAmount } = req.body;

  console.log(
    "Extracted request body:",
    userId,
    items,
    shippingAddress,
    totalAmount
  );

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    // Step 1: Check stock for all items first
    const productIds = items.map((item) => item.productId);
    console.log("Extracted product IDs:", productIds);
    const products = await Product.find({ _id: { $in: productIds } });

    for (const item of items) {
      const product = products.find((prod) => prod._id.equals(item.productId));
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found for ID ${item.productId}` });
      }
      console.log(`Checking stock for product: ${product.name}`);
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Please adjust your order.`,
        });
      }
    }

    // Step 2: Update stock levels with optimistic locking and increment sold
    const updatePromises = [];
    for (const item of items) {
      const product = products.find((prod) => prod._id.equals(item.productId));
      const currentVersion = product.version; // Store current version
      console.log(
        `Updating stock for product: ${product.name} (Version: ${currentVersion})`
      );

      product.stock -= item.quantity;
      product.sold += item.quantity; // Increment sold quantity
      product.version++; // Increment version before saving

      updatePromises.push(product.save()); // Save with version comparison
    }

    await Promise.all(updatePromises); // Wait for all updates to complete
    console.log(
      "Stock levels updated and sold quantities incremented successfully."
    );

    // Step 3: Create new order
    const newOrder = new Order({
      userId,
      items,
      shippingAddress,
      totalAmount,
      createdAt: Date.now(),
    });

    const savedOrder = await newOrder.save();

    // Step 4: Clear user cart
    const user = await User.findById(userId);
    if (user) {
      user.cart.items = [];
      await user.save();
    }

    res.status(201).json({ order: savedOrder });
  } catch (error) {
    // Handle errors, including conflicts caused by version mismatch
    if (error.name === "MongoError" && error.code === 11000) {
      // Handle potential version mismatch
      res
        .status(409)
        .json({ message: "Conflict during order creation. Please try again." });
    } else {
      res
        .status(500)
        .json({ message: "Error creating order", error: error.message });
    }
  }
};

// Get all orders (for admin panel)
export const getAllOrders = async (req, res) => {
  console.log("Request received at order.controllers: getAllOrders");

  try {
    const orders = await Order.find()
      .populate("userId", "username email")
      .populate(
        "items.productId",
        "name price discountPrice imageUrl description category stock sold version"
      );

    console.log("Orders fetched successfully:", orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Edit order
export const editOrder = async (req, res) => {
  console.log("Request received at order.controllers: editOrder");

  const { orderId } = req.params;
  console.log("Received orderId:", orderId);
  const updateData = req.body;
  console.log("Received updateData:", updateData);

  try {
    // Update the order
    await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    // Fetch the updated order and populate the fields
    let updatedOrder = await Order.findById(orderId)
      .populate("userId", "username email")
      .populate(
        "items.productId",
        "name price discountPrice imageUrl description category stock sold version"
      );

    console.log("Order updated successfully:", updatedOrder);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order" });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  console.log("Request received at order.controllers: deleteOrder");

  const { orderId } = req.params;
  console.log("Received orderId:", orderId);

  try {
    await Order.findByIdAndDelete(orderId);
    console.log("Order deleted successfully");
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order" });
  }
};

// Search orders
export const searchOrders = async (req, res) => {
  console.log("Request received at order.controllers: searchOrders");

  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const orders = await Order.find({
      $or: [
        // { "shippingAddress.fullName": { $regex: query, $options: "i" } },
        // { "shippingAddress.addressLine": { $regex: query, $options: "i" } },
        // { "shippingAddress.city": { $regex: query, $options: "i" } },
        { "shippingAddress.email": { $regex: query, $options: "i" } },
        { "shippingAddress.postalCode": { $regex: query, $options: "i" } },
        { "shippingAddress.status": { $regex: query, $options: "i" } },
        { "shippingAddress.message": { $regex: query, $options: "i" } },
        { "shippingAddress.phoneNumber": { $regex: query, $options: "i" } },
        // { "userId.username": { $regex: query, $options: "i" } },
        { "userId.email": { $regex: query, $options: "i" } },
      ],
    })
      .populate("userId", "username email")
      .populate(
        "items.productId",
        "name price discountPrice imageUrl description category stock sold version"
      );

    console.log("Orders fetched successfully:", orders.length);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Search orders by filter of status
export const filterOrdersByStatus = async (req, res) => {
  console.log("Request received at order.controllers: filterOrdersByStatus");
  try {
    const { status } = req.params;
    console.log("Received status:", status);

    let orders = await Order.find({
      "shippingAddress.status": { $eq: status }, // Use $eq for exact match
    });

    orders = await Order.populate(orders, [
      { path: "userId", select: "username email" },
      {
        path: "items.productId",
        select:
          "name price discountPrice imageUrl description category stock sold version",
      },
    ]);

    console.log("Found orders:", orders);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: error.message });
  }
};

// Backend - getSalesData controller function
export const getSalesData = async (req, res) => {
  console.log("Request received at order.controllers: getSalesData");

  const { startDate, endDate } = req.query;

  try {
    const matchCriteria = {};
    if (startDate) {
      matchCriteria.createdAt = { $gte: new Date(startDate) };
      console.log("startDate:", startDate);
      console.log("matchCriteria:", matchCriteria);
    }
    if (endDate) {
      matchCriteria.createdAt = {
        ...matchCriteria.createdAt,
        $lte: new Date(endDate),
      };
    }
    console.log("matchCriteria before aggregation:", matchCriteria);

    const salesData = await Order.aggregate([
      { $match: matchCriteria },
      { $unwind: "$items" },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
    ]);

    console.log("salesData:", salesData);

    const totalAmount = salesData.length > 0 ? salesData[0].totalAmount : 0;
    const totalQuantity = salesData.length > 0 ? salesData[0].totalQuantity : 0;

    res.status(200).json({ totalAmount, totalQuantity });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res
      .status(500)
      .json({ message: "Error fetching sales data", error: error.message });
  }
};
