const jwt = require('jsonwebtoken');


// middleware/user.js
const userMiddleware = (req, res, next) => {
  // Example authentication logic
  const token = req.headers.authorization;
  if (!token) return res.status(401).send({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
};

module.exports = {
  userMiddleware:userMiddleware
}

