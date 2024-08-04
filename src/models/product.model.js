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
        "men-shirts",
        "women-shirts",
        "men-watches",
        "women-purse",
        "men-shoes",
        "women-shoes",
        "best-selling",
        "featured-product",
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
