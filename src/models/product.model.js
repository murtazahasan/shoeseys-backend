import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
    },
    discountPercentage: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "men-all",
        "men-sneakers-casual-shoes",
        "men-formal-shoes",
        "men-sports-shoes",
        "men-sandals-slippers",
        "men-peshawari-chappal",
        "men-women-socks",
        "shoe-care-products",
        "women-all",
        "women-pumps-khusa",
        "women-heels-sandals",
        "women-loafers",
        "women-sneakers-casual-shoes",
        "women-slippers-chappal",
      ],
    },
    imageUrl: {
      type: [String],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    version: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
