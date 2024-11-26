# Course Selling Platform - Backend

## Project Overview

This project implements a backend system for a course-selling platform with a strong focus on Authentication, Authorization, and Role-Based Access Control (RBAC). The platform enables users to register and view courses, while administrators can create, update, and manage courses. Built with Node.js, Express.js, and MongoDB, the system ensures robust security practices and a modular code architecture.

## Key Features

### 1. Authentication
- Secure user registration and login
- Password hashing with bcrypt
- JWT-based session management

### 2. Authorization
- Two distinct user roles:
  - Admin: Full course management capabilities
  - User: Course viewing permissions
- Comprehensive Role-Based Access Control (RBAC)

### 3. Course Management
- Admins can:
  - Create new courses
  - Update course details
  - Delete courses
- Users can:
  - Browse available courses
  - View course details

## Project Structure

```
/src
 ├── /config
 │    └── db.js        // Database connection
 ├── /models
 │    ├── User.js      // User data model
 │    ├── Course.js    // Course data model
 ├── /routes
 │    ├── auth.js      // Authentication routes
 │    ├── course.js    // Course routes
 ├── /middlewares
 │    ├── auth.js      // Authentication middleware
 │    └── authorize.js // Authorization middleware
 ├── /controllers
 │    ├── authController.js   // Authentication logic
 │    ├── courseController.js // Course management logic
 ├── app.js            // Main server file
 └── .env              // Environment configuration
```



## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/course-selling-backend.git
   cd course-selling-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/course_selling
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=1h
   ```

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
| Method | Endpoint           | Description                | Access |
|--------|--------------------|-----------------------------|--------|
| POST   | `/api/auth/register` | User registration          | Public |
| POST   | `/api/auth/login`    | Login and receive JWT token| Public |

### Courses
| Method | Endpoint            | Description                | Access       |
|--------|---------------------|----------------------------|--------------|
| GET    | `/api/courses`      | List all courses           | User, Admin  |
| GET    | `/api/courses/:id`  | Get course details         | User, Admin  |
| POST   | `/api/courses`      | Create a new course        | Admin only   |
| PUT    | `/api/courses/:id`  | Update an existing course  | Admin only   |
| DELETE | `/api/courses/:id`  | Delete a course            | Admin only   |

## RBAC Implementation

- Roles are assigned during user registration
- Authentication middleware verifies JWT tokens
- Authorization middleware checks role-based permissions

## Best Practices

- Secure password hashing
- Stateless JWT authentication
- Modular code architecture
- Fine-grained access control

## Future Enhancements

- Course enrollment features
- Email verification
- Expanded role management


