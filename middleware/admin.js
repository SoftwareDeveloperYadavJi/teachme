const jwt = require('jsonwebtoken');
const adminRouter = require('../routes/admin');


const adminMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: "No token provided" });
  }

  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(500).send({ message: "Failed to authenticate token" });
    }

    req.adminId = decoded.id;  // Attach adminId to req
    next();
  });
};

module.exports = adminRouter;