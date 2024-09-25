const { Schema, model, Types } = require('mongoose');  // Add Types for ObjectId

// User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
  }
}, { timestamps: true });  // Add timestamps

// Admin Schema
const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });  // Add timestamps

// Courses Schema
const courseSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'adminSchema', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true }
}, { timestamps: true });


// Purchase Schema
const purchaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,  // Correctly reference ObjectId
    ref: 'user',
    required: true  // Add required
  },
  courcesId: {
    type: Schema.Types.ObjectId,  // Correctly reference ObjectId
    ref: 'courseSchema',
    required: true  // Add required
  }
}, { timestamps: true });  // Add timestamps

// Create models
const userModel = model('user', userSchema);
const adminModel = model('admin', adminSchema);
const courcesModel = model('courseSchema', courseSchema);
const purchaseModel = model('purchase', purchaseSchema);

module.exports = {
  userModel,
  adminModel,
  courcesModel,
  purchaseModel
};
