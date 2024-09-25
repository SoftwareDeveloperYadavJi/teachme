const {Router} = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { userModel , purchaseModel,courcesModel } = require('../db');
const {userMiddleware} = require('../middleware/user');
const userRouter = Router();
const {uploadAndTransformImage} = require('../utils/image');
const {z, string} = require('zod');

userRouter.post('/signup', async (req, res) => {
  const inputValidation = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    firstname:z.string(),
    lastname:z.string()
  })
  try {
    
  const parcesData = await inputValidation.safeParse(req.body);

  if (!parcesData.success) {
    return res.status(402).send({ message: parcesData.error });
  }
    let { email, password, firstname, lastname , image} = req.body;
    image = await uploadAndTransformImage(image);

    // Check if all fields are provided
    if (!email || !password || !firstname || !lastname) {
      return res.status(400).send({ message: "All fields are required" });
    }
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = await userModel.create({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      imageUrl: image
    });

    // Success response
    return res.status(201).send({ message: "Registered successfully" });
  } catch (error) {
    // Handle errors
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});



userRouter.post('/login', async (req, res) => {
  const inputValidation = z.object({
    email:string().email(),
    password:string().min(8)
  });
  try {
    const parcesData = await inputValidation.safeParse(req.body);
    if(!parcesData.success){
      return res.status(402).send({ message: parcesData.error });
    }
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Check if password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');

    // Success response
    return res.status(200).send({ message: "Logged in successfully", token });

  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
});


userRouter.get('/mycources', userMiddleware, async (req, res) => {
  try{
  const {userId} = req.userId;

  const user = await purchaseModel.findOne({_id:userId});

  const cources = user.courcesId;

  const cource = await courcesModel.find({_id:cources});


  return res.status(200).send({cource:cource});
  }catch(error){
    return res.status(500).send({message:"Server error", error:error.message});
  }
})


userRouter.post('/buycourses',userMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;  // Correctly extract userId from req.user
    const { courseId } = req.body;

    // Check if courseId is provided
    if (!courseId) {
      return res.status(400).send({ message: "Course ID is required" });
    }

    // Check if the course exists
    const course = await coursesModel.findOne({ _id: courseId });
    if (!course) {
      return res.status(404).send({ message: "Course not found" });
    }

    // Check if the user has already purchased the course
    const existingPurchase = await purchaseModel.findOne({ userId, courseId });
    if (existingPurchase) {
      return res.status(409).send({ message: "Course already purchased" });
    }

    // Create a new purchase
    await purchaseModel.create({ userId, courseId });

    // Return success response
    return res.status(200).send({ message: "Course purchased successfully", course: courseId });
  } catch (error) {
    // Handle errors
    return res.status(500).send({ message: "Server error", error: error.message });
  }
});



module.exports = {
  userRouter: userRouter
}


