const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const { userModel, purchaseModel, coursesModel } = require('../db');
const { uploadAndTransformImage } = require('../utils/image');
const { mail } = require('../utils/mail');
const { createWelcomeEmailTemplate } = require('../templates/email');

const router = Router();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const SALT_ROUNDS = 10;

// Validation Schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  image: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const purchaseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required')
});

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || []
  });
};

// Authentication Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      const error = new Error('Authentication required');
      error.status = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    error.status = 401;
    next(error);
  }
};

// Controller Functions
const signupUser = async (req, res, next) => {
  try {
    const validatedData = await signupSchema.parseAsync(req.body);
    const { email, password, firstname, lastname } = validatedData;

    // Check existing user
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.status = 409;
      throw error;
    }

    // Process image if provided
    const imageUrl = req.body.image ? await uploadAndTransformImage(req.body.image) : null;

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      imageUrl
    });

    // Send welcome email
    const emailTemplate = createWelcomeEmailTemplate(firstname, lastname);
    await mail(
      'nitiny1524@gmail.com',
      email,
      emailTemplate.subject,
      emailTemplate.text,
      emailTemplate.html
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const validatedData = await loginSchema.parseAsync(req.body);
    const { email, password } = validatedData;

    // Find user and verify credentials
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserCourses = async (req, res, next) => {
  try {
    const purchases = await purchaseModel
      .find({ userId: req.userId })
      .populate({
        path: 'courseId',
        select: '-__v'
      })
      .lean();

    const courses = purchases.map(purchase => purchase.courseId);

    res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    next(error);
  }
};

const purchaseCourse = async (req, res, next) => {
  try {
    const validatedData = await purchaseSchema.parseAsync(req.body);
    const { courseId } = validatedData;

    // Verify course exists
    const course = await coursesModel.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.status = 404;
      throw error;
    }

    // Check for existing purchase
    const existingPurchase = await purchaseModel.findOne({
      userId: req.userId,
      courseId
    });

    if (existingPurchase) {
      const error = new Error('Course already purchased');
      error.status = 409;
      throw error;
    }

    // Create purchase record
    await purchaseModel.create({
      userId: req.userId,
      courseId
    });

    res.status(201).json({
      success: true,
      message: 'Course purchased successfully',
      course: {
        id: course._id,
        title: course.title
      }
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/courses', authenticateUser, getUserCourses);
router.post('/courses/purchase', authenticateUser, purchaseCourse);

// Apply error handler
router.use(errorHandler);

module.exports = router;