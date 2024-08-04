import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userAuth from "./routes/userAuth.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import connectDB from "./db/index.js";

// Initialize configuration
dotenv.config();
const app = express();

// Get __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Enable CORS with preflight
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/user", userAuth);
app.use("/api", uploadRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// Connect to the database
connectDB();

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
