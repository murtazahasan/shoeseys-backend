// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req._id = decoded._id;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
