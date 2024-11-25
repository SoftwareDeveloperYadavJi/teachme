const jwt = require('jsonwebtoken');
const express = require('express');
const adminRouter = express.Router(); // Initialize the router properly

// Middleware to verify JWT and authenticate admin users
const adminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Ensure the Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    // Extract the token (assuming format "Bearer <token>")
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });
    }

    // Use an environment variable for the secret key
    const secretKey = process.env.JWT_SECRET || 'defaultsecret'; // Replace with a secure secret in production

    // Verify the token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Attach the decoded adminId to the request for later use
      req.adminId = decoded.id;
      next();
    });
  } catch (error) {
    // General error handling
    res.status(500).json({ message: "An error occurred while processing the request", error: error.message });
  }
};



module.exports = adminRouter;
