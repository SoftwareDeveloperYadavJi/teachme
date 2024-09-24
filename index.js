const express = require('express');
const mongoose = require('mongoose');
const { adminRouter } = require('./routes/admin');
const { userRouter } = require('./routes/user');

const app = express();
app.use(express.json());

// Correct usage of routers
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);


async function main() {
  try {
    await mongoose.connect("mongodb+srv://nitin:E29V7l2egM53YRmw@mogodb.pb6wf.mongodb.net/", {
    });
    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

main();
