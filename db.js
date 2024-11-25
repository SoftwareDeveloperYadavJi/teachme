const { Schema, model } = require('mongoose');

// User Schema
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Normalize email
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);

// Admin Schema
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Course Schema
const courseSchema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin', // Reference the Admin model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Prevent negative prices
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Purchase Schema
const purchaseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference the User model
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course', // Reference the Course model
      required: true,
    },
  },
  { timestamps: true }
);

// Create models
const User = model('User', userSchema);
const Admin = model('Admin', adminSchema);
const Course = model('Course', courseSchema);
const Purchase = model('Purchase', purchaseSchema);

// Export models
module.exports = {
  User,
  Admin,
  Course,
  Purchase,
};
