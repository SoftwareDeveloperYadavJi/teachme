// Required modules
const express = require('express');
const mongoose = require('mongoose');
const { adminRouter } = require('./routes/admin');
const { userRouter } = require('./routes/user');

// Environment variables (use dotenv for secure configuration)
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Base API versioning and route usage
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
});

// Graceful Shutdown Handling
process.on('SIGINT', async () => {
  console.log("Gracefully shutting down...");
  await mongoose.connection.close();
  process.exit(0);
});

// MongoDB connection and app startup
async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB successfully");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process on failure
  }
}

// Call main function
main();
