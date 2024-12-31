### GradeFlow Backend Documentation

---

## **Overview**
GradeFlow is a school management system backend built with Node.js, Express, and MongoDB. It provides authentication and role-based access control for administrators, teachers, and students, as well as features for managing schools, classes, and student-teacher relationships.

---

## **Table of Contents**

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Models](#models)
4. [Routes and Endpoints](#routes-and-endpoints)
5. [Middleware](#middleware)
6. [Usage](#usage)
7. [Environment Variables](#environment-variables)

---

## **Features**

- Role-based authentication for Admins, Teachers, and Students.
- Admin actions:
  - Create schools.
  - Create classes.
  - Create teacher and student accounts.
- Teacher actions:
  - Create student accounts (restricted to associated schools).
- Class association for students.
- JWT-based authentication.
- Validation with Joi.

---

## **Project Structure**

```
gradeflow/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── class.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── validate.js
│   ├── models/
│   │   ├── admin.model.js
│   │   ├── class.model.js
│   │   ├── student.model.js
│   │   └── teacher.model.js
│   ├── routes/
│   │   ├── auth.route.js
│   │   └── class.route.js
│   ├── utils/
│   │   ├── auth.validator.js
│   │   ├── class.validator.js
│   │   └── idGenerator.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## **Models**

### 1. **Admin**
- **Fields**:
  - `fullName`: Admin's full name.
  - `schoolName`: Name of the school.
  - `adminEmail`: Admin's email address.
  - `schoolEmail`: School's email address.
  - `schoolAddress`: School's physical address.
  - `password`: Admin's hashed password.
  - `schoolId`: Unique identifier for the school.
- **Role**: Admins manage schools, classes, and user accounts.

---

### 2. **Class**
- **Fields**:
  - `name`: Name of the class.
  - `schoolId`: ID of the associated school.
  - `teacher`: Reference to the teacher managing the class (optional).

---

### 3. **Teacher**
- **Fields**:
  - `fullName`: Teacher's full name.
  - `teacherId`: Unique identifier for the teacher.
  - `schoolId`: ID of the associated school.
  - `email`: Teacher's email.
  - `password`: Teacher's hashed password.

---

### 4. **Student**
- **Fields**:
  - `fullName`: Student's full name.
  - `studentId`: Unique identifier for the student.
  - `schoolId`: ID of the associated school.
  - `email`: Student's email.
  - `password`: Student's hashed password.
  - `classId`: Reference to the class the student belongs to.

---

## **Routes and Endpoints**

### 1. **Authentication Routes**

| Endpoint                   | Method | Description                        | Access   |
|----------------------------|--------|------------------------------------|----------|
| `/api/auth/admin/signup`   | POST   | Register a new admin and school.  | Public   |
| `/api/auth/admin/login`    | POST   | Login as an admin.                | Public   |
| `/api/auth/admin/create/teacher` | POST | Create a teacher account.          | Admin    |
| `/api/auth/admin/create/student` | POST | Create a student account.          | Admin/Teacher |
| `/api/auth/teacher/login`  | POST   | Login as a teacher.               | Public   |
| `/api/auth/student/login`  | POST   | Login as a student.               | Public   |

---

### 2. **Class Management Routes**

| Endpoint               | Method | Description                 | Access   |
|------------------------|--------|-----------------------------|----------|
| `/api/class/create`    | POST   | Create a new class.         | Admin    |

---

## **Middleware**

### 1. **Auth Middleware**
- File: `src/middlewares/auth.middleware.js`
- Function: `authenticate(roles)`
  - Ensures the request contains a valid JWT.
  - Verifies if the user has the required role(s).
- Usage:
  ```javascript
  const { authenticate } = require('../middlewares/auth.middleware');
  router.post('/admin/create/teacher', authenticate('admin'), createTeacher);
  ```

### 2. **Validation Middleware**
- File: `src/middlewares/validate.js`
- Function: `validate(schema)`
  - Validates the request body against a Joi schema.
- Usage:
  ```javascript
  const validate = require('../middlewares/validate');
  const { adminSignupSchema } = require('../utils/auth.validator');
  router.post('/admin/signup', validate(adminSignupSchema), adminSignup);
  ```

---

## **Usage**

### **1. Admin Signup**
- Endpoint: `POST /api/auth/admin/signup`
- Body:
  ```json
  {
    "fullName": "Jane Doe",
    "schoolName": "Elite High School",
    "adminEmail": "jane.doe@elitehs.com",
    "schoolEmail": "contact@elitehs.com",
    "schoolAddress": "123 Education Lane, Edutown",
    "password": "securepassword"
  }
  ```

### **2. Create Class**
- Endpoint: `POST /api/class/create`
- Headers: `Authorization: Bearer <admin_token>`
- Body:
  ```json
  {
    "name": "Grade 10 Mathematics",
    "schoolId": "SCH-123456789",
    "teacherId": "TCH-987654321" // Optional
  }
  ```

### **3. Create Student**
- Endpoint: `POST /api/auth/admin/create/student`
- Headers: `Authorization: Bearer <admin_or_teacher_token>`
- Body:
  ```json
  {
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "schoolId": "SCH-123456789",
    "password": "securepassword",
    "classId": "class_object_id"
  }
  ```

---

## **Environment Variables**

| Variable      | Description                          | Example                      |
|---------------|--------------------------------------|------------------------------|
| `PORT`        | Server port                         | `5000`                       |
| `DB_URI`      | MongoDB connection string           | `mongodb://localhost:27017`  |
| `JWT_SECRET`  | Secret key for JWT signing          | `your_secret_key`            |

---

## **Next Steps**
- Implement endpoints for assigning teachers to classes dynamically.
- Add routes to list all students in a class.
- Add pagination and search for better data management.

--- 

Let me know if you'd like help extending or testing any feature!