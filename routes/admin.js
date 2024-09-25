const { Router } = require('express');
const adminRouter = Router();
const { adminModel, courcesModel } = require('../db'); // Corrected typo
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const  {uploadAndTransformImage} = require('../utils/image');
const {z} = require('zod');


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


// Admin signup route
adminRouter.post('/signup', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(30),
    firstname: z.string(),
    lastname: z.string()
  });
  try {
    const parcesData = await schema.safeParse(req.body);
    if(!parcesData.success){
      return res.status(400).send({ message: parcesData.error });
    }
    let { email, password, firstname, lastname , image } = req.body;
    
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).send({ message: "All fields are required" });
    }
    image = await uploadAndTransformImage(image);
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new adminModel({ email, password: hashedPassword, firstname, lastname , imageUrl: image});
    console.log(admin);
    await admin.save();
    return res.status(200).send({ message: "Registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

// Admin login route
adminRouter.post('/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(30)
  });
  try {
    const parcesData = await schema.safeParse(req.body);
    if(!parcesData.success){
      return res.status(410).send({ message: parcesData.error });
    }
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ message: "Email or password not provided" });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secretkey'); // Use env variable for secret
    return res.status(200).send({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

// Create course route
adminRouter.post('/course', adminMiddleware, async (req, res) => {
  try {
    let { title, description, price, image } = req.body;
    image = await uploadAndTransformImage(image);
    console.log(image);
    if (!title || !description || !price || !image) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const course = await courcesModel.create({
      adminId: req.adminId, title, description, price, image
    });
    return res.status(200).send({ message: "Course created successfully", course });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

// Update course route
adminRouter.put('/course', adminMiddleware, async (req, res) => {
  try {
    const { courseId, title, description, price, image } = req.body;
    const course = await coursesModel.updateOne(
      { _id: courseId, adminId: req.adminId },  // Ensure adminId matches creatorId
      { title, description, price, image }
    );

    if (!course) {
      return res.status(404).send({ message: "Course not found or unauthorized" });
    }

    return res.status(200).send({ message: "Course updated successfully", courseId });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

// Get all courses route
adminRouter.get('/allcourses', adminMiddleware, async (req, res) => {
  try {
    const courses = await courcesModel.find({ adminId: req.adminId });
    return res.status(200).send({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});

module.exports = {
  adminRouter: adminRouter
}
