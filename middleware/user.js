const jwt = require('jsonwebtoken');

// Middleware to authenticate user using JWT
const userMiddleware = (req, res, next) => {
  try {
    // Extract Authorization header
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
    const decoded = jwt.verify(token, secretKey);

    // Attach the decoded payload to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle specific JWT errors for better debugging
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired" });
    }

    // General error response
    res.status(500).json({ message: "An error occurred during token validation", error: error.message });
  }
};

module.exports = {
  userMiddleware,
};
