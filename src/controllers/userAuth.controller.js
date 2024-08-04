import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Signup function
export const signup = async (req, res) => {
  console.log("Signup request received");
  const { username, email, password, isAdmin = false } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      isAdmin,
    });

    console.log("User created successfully:", user._id);
    res.status(201).json({ user });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Error signing up!", error });
  }
};

// Login function
export const login = async (req, res) => {
  console.log("Login request received");
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Invalid email:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Wrong password for user:", email);
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    console.log("User logged in successfully:", user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(Date.now() + 86400000),
    });

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in!", error });
  }
};

// Logout function
export const logout = async (req, res) => {
  console.log("Logout request received");

  try {
    res.clearCookie("token");
    console.log("User logged out successfully");
    res.status(200).json({ message: "Logged out successfully!" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Error logging out!", error });
  }
};

// Get user details
export const myDetails = async (req, res) => {
  console.log("Get user details request received");

  try {
    const user = await User.findById(req._id);
    if (!user) {
      console.log("User not found:", req._id);
      return res.status(404).json({ message: "Cannot find user" });
    }

    console.log("User details fetched successfully:", user._id);
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Error getting my details!", error });
  }
};
