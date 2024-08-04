// src/routes/upload.routes.js
import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs";

const router = express.Router();

router.post("/upload", upload.array("images"), (req, res) => {
  const files = req.files;

  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(file.path, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // Remove the file from the server after uploading to Cloudinary
          fs.unlink(file.path, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(result.secure_url);
            }
          });
        }
      });
    });
  });

  Promise.all(uploadPromises)
    .then((imageUrl) => {
      res.status(200).json({
        message: "Files uploaded successfully",
        imageUrl,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Failed to upload files to Cloudinary",
        error: error.message,
      });
    });
});

export default router;
