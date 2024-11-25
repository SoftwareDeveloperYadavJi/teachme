const { Router } = require('express');
const { z } = require('zod');
const { coursesModel } = require('../db');
const { uploadAndTransformImage } = require('../utils/image');

const router = Router();

// Validation Schemas
const courseSchema = z.object({
  title: z.string().min(1, 'Title is required')
    .max(100, 'Title must not exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  price: z.number().positive('Price must be positive')
    .max(999999, 'Price is too high'),
  image: z.string().optional()
});

const courseIdSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required')
});

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

// Controller Functions
const createCourse = async (req, res, next) => {
  try {
    const validatedData = await courseSchema.parseAsync(req.body);
    
    // Process image if provided
    if (validatedData.image) {
      validatedData.image = await uploadAndTransformImage(validatedData.image);
    }

    const course = await coursesModel.create({
      ...validatedData,
      adminId: req.adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        image: course.image
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { courseId } = await courseIdSchema.parseAsync({ courseId: req.params.courseId });
    const validatedData = await courseSchema.parseAsync(req.body);

    // Process image if provided
    if (validatedData.image) {
      validatedData.image = await uploadAndTransformImage(validatedData.image);
    }

    const course = await coursesModel.findOneAndUpdate(
      { _id: courseId, adminId: req.adminId },
      {
        ...validatedData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!course) {
      const error = new Error('Course not found or unauthorized');
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        price: course.price,
        image: course.image
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const courses = await coursesModel.find()
      .select('-__v')
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await coursesModel.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCourses: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = await courseIdSchema.parseAsync({ courseId: req.params.courseId });

    const course = await coursesModel.findOneAndDelete({
      _id: courseId,
      adminId: req.adminId
    });

    if (!course) {
      const error = new Error('Course not found or unauthorized');
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
      courseId: course._id
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.post(
  '/courses',
  courseSchema.parseAsync,
  createCourse
);

router.put(
  '/courses/:courseId',
  courseSchema.parseAsync,
  updateCourse
);

router.get(
  '/courses',
  getAllCourses
);

router.delete(
  '/courses/:courseId',
  deleteCourse
);

// Apply error handler
router.use(errorHandler);

module.exports = router;