const { Router } = require('express');
const { z } = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { adminModel, coursesModel } = require('../db');
const { uploadAndTransformImage } = require('../utils/image');
const { mail } = require('../utils/mail');
const { createWelcomeEmailTemplate } = require('../templates/email');

const router = Router();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';
const SALT_ROUNDS = 10;

// Validation schemas
const adminSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'Password must not exceed 30 characters'),
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  image: z.string().optional()
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || []
  });
};

// Auth middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      const error = new Error('No token provided');
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error);
  }
};

// Controller functions
const signupAdmin = async (req, res, next) => {
  try {
    const validatedData = await adminSchema.parseAsync(req.body);
    const { email, password, firstname, lastname } = validatedData;
    
    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    // Process image if provided
    const imageUrl = req.body.image ? await uploadAndTransformImage(req.body.image) : null;
    
    // Create admin
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = new adminModel({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      imageUrl
    });
    
    await admin.save();

    // Send welcome email
    const emailContent = createWelcomeEmailTemplate(firstname, lastname);
    await mail(
      'nitiny1524@gmail.com',
      email,
      emailContent.subject,
      emailContent.text,
      emailContent.html
    );

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

const loginAdmin = async (req, res, next) => {
  try {
    const validatedData = await loginSchema.parseAsync(req.body);
    const { email, password } = validatedData;

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstname: admin.firstname,
        lastname: admin.lastname
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCourse = async (req, res, next) => {
  try {
    const validatedData = await courseSchema.parseAsync(req.body);
    const { title, description, price } = validatedData;

    const imageUrl = req.body.image ? await uploadAndTransformImage(req.body.image) : null;

    const course = await coursesModel.create({
      adminId: req.adminId,
      title,
      description,
      price,
      image: imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const validatedData = await courseSchema.parseAsync(req.body);
    
    const course = await coursesModel.findOneAndUpdate(
      { _id: courseId, adminId: req.adminId },
      { ...validatedData },
      { new: true }
    );

    if (!course) {
      const error = new Error('Course not found or unauthorized');
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await coursesModel.find({ adminId: req.adminId })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/signup', signupAdmin);
router.post('/login', loginAdmin);
router.post('/course', authenticateAdmin, createCourse);
router.put('/course/:courseId', authenticateAdmin, updateCourse);
router.get('/courses', authenticateAdmin, getAllCourses);

// Apply error handler
router.use(errorHandler);

module.exports = router;