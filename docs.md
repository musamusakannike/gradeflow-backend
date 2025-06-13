# GradeFlow API Documentation

This document provides comprehensive documentation for the GradeFlow School Management System API, including sample requests for each endpoint.

## Table of Contents

1. [Authentication](#1-authentication)
2. [School Management](#2-school-management)
3. [User Management](#3-user-management)
4. [Academic Management](#4-academic-management)
5. [Class Management](#5-class-management)
6. [Subject Management](#6-subject-management)
7. [Student Management](#7-student-management)
8. [Parent Management](#8-parent-management)
9. [Result Management](#9-result-management)
10. [Fee Management](#10-fee-management)
11. [Attendance Management](#11-attendance-management)
12. [Report Generation](#12-report-generation)
13. [Notification System](#13-notification-system)
14. [Event Management](#14-event-management)
15. [Messaging System](#15-messaging-system)
16. [Dashboard](#16-dashboard)

## Base URL

All URLs referenced in the documentation have the following base:

```plaintext
https://gradeflow-backend.onrender.com/api
```

## Authentication

All protected routes require a valid JWT token in the Authorization header:

```plaintext
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication

### Register Super Admin

- **URL**: `/auth/register-super-admin`
- **Method**: `POST`
- **Access**: Public
- **Description**: Register a super admin user

#### Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Success Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "firstName": "John",
    "lastName": "Doe",
    "email": "admin@example.com",
    "role": "super_admin"
  }
}
```

### Register School

- **URL**: `/auth/register-school`
- **Method**: `POST`
- **Access**: Public
- **Description**: Register a new school and school admin

#### Request Body

```json
{
  "schoolName": "Example School",
  "address": "123 School Street",
  "city": "Lagos",
  "state": "Lagos State",
  "country": "Nigeria",
  "phoneNumber": "+2341234567890",
  "email": "school@example.com",
  "website": "https://school.example.com",
  "adminFirstName": "Jane",
  "adminLastName": "Smith",
  "adminEmail": "jane@example.com",
  "adminPassword": "password123"
}
```

#### Success Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109cb",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "role": "school_admin",
    "school": "60d0fe4f5311236168a109cc"
  }
}
```

### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Description**: Login a user

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Success Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109cd",
    "firstName": "User",
    "lastName": "Name",
    "email": "user@example.com",
    "role": "teacher",
    "school": "60d0fe4f5311236168a109cc"
  }
}
```

### Get Current User

- **URL**: `/auth/me`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get the currently logged in user

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "firstName": "User",
    "lastName": "Name",
    "email": "user@example.com",
    "role": "teacher",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User Details

- **URL**: `/auth/updatedetails`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Update user details

#### Request Body

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "email": "updated@example.com",
  "phoneNumber": "+2349876543210"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "firstName": "Updated",
    "lastName": "Name",
    "email": "updated@example.com",
    "phoneNumber": "+2349876543210",
    "role": "teacher",
    "school": "60d0fe4f5311236168a109cc"
  }
}
```

### Update Password

- **URL**: `/auth/updatepassword`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Update user password

#### Request Body

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Success Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Forgot Password

- **URL**: `/auth/forgotpassword`
- **Method**: `POST`
- **Access**: Public
- **Description**: Send password reset email

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Success Response

```json
{
  "success": true,
  "data": "Email sent"
}
```

### Reset Password

- **URL**: `/auth/resetpassword/:resettoken`
- **Method**: `PUT`
- **Access**: Public
- **Description**: Reset password using token

#### Request Body

```json
{
  "password": "newpassword123"
}
```

#### Success Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. School Management

### Get All Schools

- **URL**: `/schools`
- **Method**: `GET`
- **Access**: Private/SuperAdmin
- **Description**: Get all schools

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Example School",
      "address": "123 School Street",
      "city": "Lagos",
      "state": "Lagos State",
      "country": "Nigeria",
      "phoneNumber": "+2341234567890",
      "email": "school@example.com",
      "website": "https://school.example.com",
      "admin": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com"
      },
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single School

- **URL**: `/schools/:id`
- **Method**: `GET`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Get a single school by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Example School",
    "address": "123 School Street",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "phoneNumber": "+2341234567890",
    "email": "school@example.com",
    "website": "https://school.example.com",
    "admin": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create School

- **URL**: `/schools`
- **Method**: `POST`
- **Access**: Private/SuperAdmin
- **Description**: Create a new school

#### Request Body

```json
{
  "name": "New School",
  "address": "456 School Avenue",
  "city": "Abuja",
  "state": "FCT",
  "country": "Nigeria",
  "phoneNumber": "+2341234567891",
  "email": "newschool@example.com",
  "website": "https://newschool.example.com",
  "adminFirstName": "Admin",
  "adminLastName": "User",
  "adminEmail": "admin@newschool.com",
  "adminPassword": "password123"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "name": "New School",
    "address": "456 School Avenue",
    "city": "Abuja",
    "state": "FCT",
    "country": "Nigeria",
    "phoneNumber": "+2341234567891",
    "email": "newschool@example.com",
    "website": "https://newschool.example.com",
    "admin": "60d0fe4f5311236168a109ce",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update School

- **URL**: `/schools/:id`
- **Method**: `PUT`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Update a school

#### Request Body

```json
{
  "name": "Updated School Name",
  "phoneNumber": "+2341234567892",
  "email": "updated@example.com"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cc",
    "name": "Updated School Name",
    "address": "123 School Street",
    "city": "Lagos",
    "state": "Lagos State",
    "country": "Nigeria",
    "phoneNumber": "+2341234567892",
    "email": "updated@example.com",
    "website": "https://school.example.com",
    "admin": "60d0fe4f5311236168a109cb",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete School

- **URL**: `/schools/:id`
- **Method**: `DELETE`
- **Access**: Private/SuperAdmin
- **Description**: Delete a school

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## 3. User Management

### Get All Users

- **URL**: `/users`
- **Method**: `GET`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Get all users

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "role": "school_admin",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109cd",
      "firstName": "User",
      "lastName": "Name",
      "email": "user@example.com",
      "role": "teacher",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single User

- **URL**: `/users/:id`
- **Method**: `GET`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Get a single user by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "firstName": "User",
    "lastName": "Name",
    "email": "user@example.com",
    "role": "teacher",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create User

- **URL**: `/users`
- **Method**: `POST`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Create a new user

#### Request Body

```json
{
  "firstName": "New",
  "lastName": "Teacher",
  "email": "teacher@example.com",
  "password": "password123",
  "role": "teacher",
  "phoneNumber": "+2341234567893"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cf",
    "firstName": "New",
    "lastName": "Teacher",
    "email": "teacher@example.com",
    "role": "teacher",
    "phoneNumber": "+2341234567893",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update User

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Update a user

#### Request Body

```json
{
  "firstName": "Updated",
  "lastName": "Teacher",
  "phoneNumber": "+2341234567894"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cf",
    "firstName": "Updated",
    "lastName": "Teacher",
    "email": "teacher@example.com",
    "role": "teacher",
    "phoneNumber": "+2341234567894",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete User

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Access**: Private/SuperAdmin/SchoolAdmin
- **Description**: Delete a user

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## 4. Academic Management

### Get Academic Sessions

- **URL**: `/academic/sessions/:schoolId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get all academic sessions for a school

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d0",
      "name": "2022/2023",
      "startDate": "2022-09-01T00:00:00.000Z",
      "endDate": "2023-07-31T00:00:00.000Z",
      "school": "60d0fe4f5311236168a109cc",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Academic Session

- **URL**: `/academic/sessions/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get a single academic session by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d0",
    "name": "2022/2023",
    "startDate": "2022-09-01T00:00:00.000Z",
    "endDate": "2023-07-31T00:00:00.000Z",
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Academic Session

- **URL**: `/academic/sessions`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new academic session

#### Request Body

```json
{
  "name": "2023/2024",
  "startDate": "2023-09-01",
  "endDate": "2024-07-31"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d1",
    "name": "2023/2024",
    "startDate": "2023-09-01T00:00:00.000Z",
    "endDate": "2024-07-31T00:00:00.000Z",
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Academic Session

- **URL**: `/academic/sessions/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update an academic session

#### Request Body

```json
{
  "name": "Updated 2023/2024",
  "endDate": "2024-08-15"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d1",
    "name": "Updated 2023/2024",
    "startDate": "2023-09-01T00:00:00.000Z",
    "endDate": "2024-08-15T00:00:00.000Z",
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Academic Session

- **URL**: `/academic/sessions/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete an academic session

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Get Terms

- **URL**: `/academic/terms/:sessionId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get all terms for an academic session

#### Success Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d2",
      "name": "First Term",
      "academicSession": "60d0fe4f5311236168a109d0",
      "startDate": "2022-09-01T00:00:00.000Z",
      "endDate": "2022-12-15T00:00:00.000Z",
      "allowScoring": true,
      "school": "60d0fe4f5311236168a109cc",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109d3",
      "name": "Second Term",
      "academicSession": "60d0fe4f5311236168a109d0",
      "startDate": "2023-01-10T00:00:00.000Z",
      "endDate": "2023-04-15T00:00:00.000Z",
      "allowScoring": false,
      "school": "60d0fe4f5311236168a109cc",
      "isActive": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109d4",
      "name": "Third Term",
      "academicSession": "60d0fe4f5311236168a109d0",
      "startDate": "2023-05-01T00:00:00.000Z",
      "endDate": "2023-07-31T00:00:00.000Z",
      "allowScoring": false,
      "school": "60d0fe4f5311236168a109cc",
      "isActive": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Term

- **URL**: `/academic/terms/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get a single term by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d2",
    "name": "First Term",
    "academicSession": "60d0fe4f5311236168a109d0",
    "startDate": "2022-09-01T00:00:00.000Z",
    "endDate": "2022-12-15T00:00:00.000Z",
    "allowScoring": true,
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Term

- **URL**: `/academic/terms/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a term

#### Request Body

```json
{
  "startDate": "2022-09-05",
  "endDate": "2022-12-20"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d2",
    "name": "First Term",
    "academicSession": "60d0fe4f5311236168a109d0",
    "startDate": "2022-09-05T00:00:00.000Z",
    "endDate": "2022-12-20T00:00:00.000Z",
    "allowScoring": true,
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Activate Term

- **URL**: `/academic/terms/:id/activate`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Set a term as active

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d3",
    "name": "Second Term",
    "academicSession": "60d0fe4f5311236168a109d0",
    "startDate": "2023-01-10T00:00:00.000Z",
    "endDate": "2023-04-15T00:00:00.000Z",
    "allowScoring": false,
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 5. Class Management

### Get All Classes

- **URL**: `/classes/:schoolId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher/ClassTeacher
- **Description**: Get all classes for a school

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d5",
      "name": "JSS 1A",
      "classTeacher": {
        "firstName": "User",
        "lastName": "Name",
        "email": "user@example.com"
      },
      "academicSession": {
        "name": "2022/2023"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109d6",
      "name": "JSS 1B",
      "classTeacher": {
        "firstName": "New",
        "lastName": "Teacher",
        "email": "teacher@example.com"
      },
      "academicSession": {
        "name": "2022/2023"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Class

- **URL**: `/classes/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher/ClassTeacher
- **Description**: Get a single class by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d5",
    "name": "JSS 1A",
    "classTeacher": {
      "firstName": "User",
      "lastName": "Name",
      "email": "user@example.com"
    },
    "academicSession": {
      "name": "2022/2023"
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Class

- **URL**: `/classes`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new class

#### Request Body

```json
{
  "name": "JSS 2A",
  "classTeacher": "60d0fe4f5311236168a109cd",
  "academicSession": "60d0fe4f5311236168a109d0"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d7",
    "name": "JSS 2A",
    "classTeacher": "60d0fe4f5311236168a109cd",
    "academicSession": "60d0fe4f5311236168a109d0",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Class

- **URL**: `/classes/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a class

#### Request Body

```json
{
  "name": "JSS 2B",
  "classTeacher": "60d0fe4f5311236168a109cf"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d7",
    "name": "JSS 2B",
    "classTeacher": "60d0fe4f5311236168a109cf",
    "academicSession": "60d0fe4f5311236168a109d0",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Class

- **URL**: `/classes/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete a class

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## 6. Subject Management

### Get Subjects by Class

- **URL**: `/subjects/class/:classId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher
- **Description**: Get all subjects for a class

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d8",
      "name": "Mathematics",
      "code": "MTH101",
      "teacher": {
        "firstName": "User",
        "lastName": "Name",
        "email": "user@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 100,
        "test2": 100,
        "exam": 100
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109d9",
      "name": "English Language",
      "code": "ENG101",
      "teacher": {
        "firstName": "New",
        "lastName": "Teacher",
        "email": "teacher@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 100,
        "test2": 100,
        "exam": 100
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Subjects by Teacher

- **URL**: `/subjects/teacher/:teacherId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher
- **Description**: Get all subjects taught by a teacher

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d8",
      "name": "Mathematics",
      "code": "MTH101",
      "teacher": {
        "firstName": "User",
        "lastName": "Name",
        "email": "user@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 100,
        "test2": 100,
        "exam": 100
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Subject

- **URL**: `/subjects/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher/ClassTeacher/Student
- **Description**: Get a single subject by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d8",
    "name": "Mathematics",
    "code": "MTH101",
    "teacher": {
      "firstName": "User",
      "lastName": "Name",
      "email": "user@example.com"
    },
    "class": {
      "name": "JSS 1A"
    },
    "students": [
      {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      }
    ],
    "allowStudentAddition": true,
    "obtainableScores": {
      "test1": 100,
      "test2": 100,
      "exam": 100
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Subject

- **URL**: `/subjects`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new subject

#### Request Body

```json
{
  "name": "Physics",
  "code": "PHY101",
  "teacher": "60d0fe4f5311236168a109cd",
  "class": "60d0fe4f5311236168a109d5",
  "obtainableScores": {
    "test1": 30,
    "test2": 30,
    "exam": 40
  }
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cd",
    "class": "60d0fe4f5311236168a109d5",
    "students": [],
    "allowStudentAddition": true,
    "obtainableScores": {
      "test1": 30,
      "test2": 30,
      "exam": 40
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Subject

- **URL**: `/subjects/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a subject

#### Request Body

```json
{
  "name": "Advanced Physics",
  "teacher": "60d0fe4f5311236168a109cf"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Advanced Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cf",
    "class": "60d0fe4f5311236168a109d5",
    "students": [],
    "allowStudentAddition": true,
    "obtainableScores": {
      "test1": 30,
      "test2": 30,
      "exam": 40
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Subject

- **URL**: `/subjects/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete a subject

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Toggle Student Addition

- **URL**: `/subjects/:id/toggle-student-addition`
- **Method**: `PUT`
- **Access**: Private/Teacher
- **Description**: Toggle whether students can add themselves to this subject

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Advanced Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cf",
    "class": "60d0fe4f5311236168a109d5",
    "students": [],
    "allowStudentAddition": false,
    "obtainableScores": {
      "test1": 30,
      "test2": 30,
      "exam": 40
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Obtainable Scores

- **URL**: `/subjects/:id/obtainable-scores`
- **Method**: `PUT`
- **Access**: Private/Teacher
- **Description**: Update the obtainable scores for a subject

#### Request Body

```json
{
  "obtainableScores": {
    "test1": 20,
    "test2": 20,
    "exam": 60
  }
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Advanced Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cf",
    "class": "60d0fe4f5311236168a109d5",
    "students": [],
    "allowStudentAddition": false,
    "obtainableScores": {
      "test1": 20,
      "test2": 20,
      "exam": 60
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Add Student to Subject

- **URL**: `/subjects/:id/add-student/:studentId`
- **Method**: `PUT`
- **Access**: Private/Teacher/Student
- **Description**: Add a student to a subject

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Advanced Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cf",
    "class": "60d0fe4f5311236168a109d5",
    "students": ["60d0fe4f5311236168a109db"],
    "allowStudentAddition": false,
    "obtainableScores": {
      "test1": 20,
      "test2": 20,
      "exam": 60
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Remove Student from Subject

- **URL**: `/subjects/:id/remove-student/:studentId`
- **Method**: `PUT`
- **Access**: Private/Teacher/Student
- **Description**: Remove a student from a subject

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109da",
    "name": "Advanced Physics",
    "code": "PHY101",
    "teacher": "60d0fe4f5311236168a109cf",
    "class": "60d0fe4f5311236168a109d5",
    "students": [],
    "allowStudentAddition": false,
    "obtainableScores": {
      "test1": 20,
      "test2": 20,
      "exam": 60
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Subjects by Student

- **URL**: `/subjects/student/:studentId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher/ClassTeacher/Student
- **Description**: Get all subjects for a student

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109d8",
      "name": "Mathematics",
      "code": "MTH101",
      "teacher": {
        "firstName": "User",
        "lastName": "Name",
        "email": "user@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 100,
        "test2": 100,
        "exam": 100
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109d9",
      "name": "English Language",
      "code": "ENG101",
      "teacher": {
        "firstName": "New",
        "lastName": "Teacher",
        "email": "teacher@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 100,
        "test2": 100,
        "exam": 100
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Available Subjects

- **URL**: `/subjects/available/:studentId`
- **Method**: `GET`
- **Access**: Private/Student
- **Description**: Get all available subjects that a student can register for

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109da",
      "name": "Advanced Physics",
      "code": "PHY101",
      "teacher": {
        "firstName": "New",
        "lastName": "Teacher",
        "email": "teacher@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "allowStudentAddition": true,
      "obtainableScores": {
        "test1": 20,
        "test2": 20,
        "exam": 60
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 7. Student Management

### Get Students by School

- **URL**: `/students/school/:schoolId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get all students for a school

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109db",
      "studentId": "SCH/23/1234",
      "user": {
        "firstName": "Student",
        "lastName": "One",
        "email": "student1@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "status": "Active",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109dc",
      "studentId": "SCH/23/1235",
      "user": {
        "firstName": "Student",
        "lastName": "Two",
        "email": "student2@example.com"
      },
      "class": {
        "name": "JSS 1B"
      },
      "status": "Active",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Students by Class

- **URL**: `/students/class/:classId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Get all students for a class

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109db",
      "studentId": "SCH/23/1234",
      "user": {
        "firstName": "Student",
        "lastName": "One",
        "email": "student1@example.com"
      },
      "class": {
        "name": "JSS 1A"
      },
      "status": "Active",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Student

- **URL**: `/students/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher/Student/Parent
- **Description**: Get a single student by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109db",
    "studentId": "SCH/23/1234",
    "user": {
      "firstName": "Student",
      "lastName": "One",
      "email": "student1@example.com"
    },
    "class": {
      "name": "JSS 1A"
    },
    "dateOfBirth": "2005-05-15T00:00:00.000Z",
    "gender": "Male",
    "address": "123 Student Street, Lagos",
    "parentName": "Parent One",
    "parentPhone": "+2341234567895",
    "parentEmail": "parent1@example.com",
    "status": "Active",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Student

- **URL**: `/students`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new student

#### Request Body

```json
{
  "firstName": "Student",
  "lastName": "Three",
  "email": "student3@example.com",
  "password": "password123",
  "class": "60d0fe4f5311236168a109d5",
  "dateOfBirth": "2005-08-20",
  "gender": "Female",
  "address": "456 Student Avenue, Lagos",
  "parentName": "Parent Three",
  "parentPhone": "+2341234567896",
  "parentEmail": "parent3@example.com"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109dd",
    "user": "60d0fe4f5311236168a109de",
    "studentId": "SCH/23/1236",
    "class": "60d0fe4f5311236168a109d5",
    "dateOfBirth": "2005-08-20T00:00:00.000Z",
    "gender": "Female",
    "address": "456 Student Avenue, Lagos",
    "parentName": "Parent Three",
    "parentPhone": "+2341234567896",
    "parentEmail": "parent3@example.com",
    "status": "Active",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Student

- **URL**: `/students/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a student

#### Request Body

```json
{
  "firstName": "Updated",
  "lastName": "Student",
  "address": "789 Updated Street, Lagos"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109dd",
    "user": "60d0fe4f5311236168a109de",
    "studentId": "SCH/23/1236",
    "class": "60d0fe4f5311236168a109d5",
    "dateOfBirth": "2005-08-20T00:00:00.000Z",
    "gender": "Female",
    "address": "789 Updated Street, Lagos",
    "parentName": "Parent Three",
    "parentPhone": "+2341234567896",
    "parentEmail": "parent3@example.com",
    "status": "Active",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Student

- **URL**: `/students/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete a student

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Update Student Status

- **URL**: `/students/:id/status`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a student's status

#### Request Body

```json
{
  "status": "Graduated"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109db",
    "user": "60d0fe4f5311236168a109df",
    "studentId": "SCH/23/1234",
    "class": "60d0fe4f5311236168a109d5",
    "status": "Graduated",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Student Parents

- **URL**: `/students/:id/parents`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Student
- **Description**: Get all parents of a student

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e0",
      "user": {
        "firstName": "Parent",
        "lastName": "One",
        "email": "parent1@example.com",
        "phoneNumber": "+2341234567895"
      },
      "relationship": "Father",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 8. Parent Management

### Get Parents by School

- **URL**: `/parents/school/:schoolId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin
- **Description**: Get all parents for a school

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e0",
      "user": {
        "firstName": "Parent",
        "lastName": "One",
        "email": "parent1@example.com",
        "phoneNumber": "+2341234567895"
      },
      "children": [
        {
          "studentId": "SCH/23/1234",
          "user": {
            "firstName": "Student",
            "lastName": "One"
          }
        }
      ],
      "relationship": "Father",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109e1",
      "user": {
        "firstName": "Parent",
        "lastName": "Two",
        "email": "parent2@example.com",
        "phoneNumber": "+2341234567896"
      },
      "children": [
        {
          "studentId": "SCH/23/1235",
          "user": {
            "firstName": "Student",
            "lastName": "Two"
          }
        }
      ],
      "relationship": "Mother",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Parent

- **URL**: `/parents/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Parent
- **Description**: Get a single parent by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e0",
    "user": {
      "firstName": "Parent",
      "lastName": "One",
      "email": "parent1@example.com",
      "phoneNumber": "+2341234567895"
    },
    "children": [
      {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        },
        "class": {
          "name": "JSS 1A"
        }
      }
    ],
    "occupation": "Engineer",
    "address": "123 Parent Street, Lagos",
    "alternatePhone": "+2341234567897",
    "relationship": "Father",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Parent

- **URL**: `/parents`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new parent

#### Request Body

```json
{
  "firstName": "Parent",
  "lastName": "Three",
  "email": "parent3@example.com",
  "password": "password123",
  "phoneNumber": "+2341234567898",
  "children": ["60d0fe4f5311236168a109dd"],
  "occupation": "Doctor",
  "address": "789 Parent Avenue, Lagos",
  "alternatePhone": "+2341234567899",
  "relationship": "Mother"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e2",
    "user": "60d0fe4f5311236168a109e3",
    "children": ["60d0fe4f5311236168a109dd"],
    "occupation": "Doctor",
    "address": "789 Parent Avenue, Lagos",
    "alternatePhone": "+2341234567899",
    "relationship": "Mother",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Parent

- **URL**: `/parents/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update a parent

#### Request Body

```json
{
  "firstName": "Updated",
  "lastName": "Parent",
  "occupation": "Professor",
  "address": "101 Updated Avenue, Lagos"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e2",
    "user": "60d0fe4f5311236168a109e3",
    "children": ["60d0fe4f5311236168a109dd"],
    "occupation": "Professor",
    "address": "101 Updated Avenue, Lagos",
    "alternatePhone": "+2341234567899",
    "relationship": "Mother",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Parent

- **URL**: `/parents/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete a parent

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Add Child to Parent

- **URL**: `/parents/:id/add-child/:studentId`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Add a child to a parent

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e0",
    "user": "60d0fe4f5311236168a109e4",
    "children": ["60d0fe4f5311236168a109db", "60d0fe4f5311236168a109dc"],
    "relationship": "Father",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Remove Child from Parent

- **URL**: `/parents/:id/remove-child/:studentId`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Remove a child from a parent

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e0",
    "user": "60d0fe4f5311236168a109e4",
    "children": ["60d0fe4f5311236168a109db"],
    "relationship": "Father",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Parent Children

- **URL**: `/parents/:id/children`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Parent
- **Description**: Get all children of a parent

#### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109db",
      "studentId": "SCH/23/1234",
      "user": {
        "firstName": "Student",
        "lastName": "One"
      },
      "class": {
        "name": "JSS 1A"
      },
      "status": "Active",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Parent by User ID

- **URL**: `/parents/user/:userId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Parent
- **Description**: Get a parent by user ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e0",
    "user": {
      "firstName": "Parent",
      "lastName": "One",
      "email": "parent1@example.com",
      "phoneNumber": "+2341234567895"
    },
    "children": [
      {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        },
        "class": {
          "name": "JSS 1A"
        }
      }
    ],
    "relationship": "Father",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 9. Result Management

### Get Results by Term and Class

- **URL**: `/results/term/:termId/class/:classId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Get all results for a term and class

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e5",
      "student": {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      },
      "class": {
        "name": "JSS 1A"
      },
      "term": {
        "name": "First Term"
      },
      "totalScore": 450,
      "averageScore": 75,
      "position": 1,
      "numberOfSubjects": 6,
      "classTeacherRemark": "Excellent performance",
      "principalRemark": "Keep it up",
      "isPublished": true,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109e6",
      "student": {
        "studentId": "SCH/23/1235",
        "user": {
          "firstName": "Student",
          "lastName": "Two"
        }
      },
      "class": {
        "name": "JSS 1A"
      },
      "term": {
        "name": "First Term"
      },
      "totalScore": 420,
      "averageScore": 70,
      "position": 2,
      "numberOfSubjects": 6,
      "classTeacherRemark": "Very good performance",
      "principalRemark": "Good job",
      "isPublished": true,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Student Result

- **URL**: `/results/student/:studentId/term/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher/Student/Parent
- **Description**: Get a student's result for a term

#### Success Response

```json
{
  "success": true,
  "data": {
    "result": {
      "_id": "60d0fe4f5311236168a109e5",
      "student": {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      },
      "class": {
        "name": "JSS 1A"
      },
      "term": {
        "name": "First Term"
      },
      "totalScore": 450,
      "averageScore": 75,
      "position": 1,
      "numberOfSubjects": 6,
      "classTeacherRemark": "Excellent performance",
      "principalRemark": "Keep it up",
      "isPublished": true,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "scores": [
      {
        "_id": "60d0fe4f5311236168a109e7",
        "student": "60d0fe4f5311236168a109db",
        "subject": {
          "name": "Mathematics",
          "code": "MTH101",
          "obtainableScores": {
            "test1": 100,
            "test2": 100,
            "exam": 100
          }
        },
        "term": "60d0fe4f5311236168a109d2",
        "test1": 25,
        "test2": 28,
        "exam": 35,
        "percentageScore": 88,
        "grade": "A",
        "remark": "Excellent",
        "teacher": "60d0fe4f5311236168a109cd",
        "school": "60d0fe4f5311236168a109cc",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "_id": "60d0fe4f5311236168a109e8",
        "student": "60d0fe4f5311236168a109db",
        "subject": {
          "name": "English Language",
          "code": "ENG101",
          "obtainableScores": {
            "test1": 100,
            "test2": 100,
            "exam": 100
          }
        },
        "term": "60d0fe4f5311236168a109d2",
        "test1": 22,
        "test2": 25,
        "exam": 30,
        "percentageScore": 77,
        "grade": "A",
        "remark": "Excellent",
        "teacher": "60d0fe4f5311236168a109cf",
        "school": "60d0fe4f5311236168a109cc",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Create or Update Score

- **URL**: `/results/scores`
- **Method**: `POST`
- **Access**: Private/Teacher
- **Description**: Create or update a score for a student

#### Request Body

```json
{
  "student": "60d0fe4f5311236168a109db",
  "subject": "60d0fe4f5311236168a109d8",
  "term": "60d0fe4f5311236168a109d2",
  "test1": 27,
  "test2": 29,
  "exam": 38
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e7",
    "student": "60d0fe4f5311236168a109db",
    "subject": "60d0fe4f5311236168a109d8",
    "term": "60d0fe4f5311236168a109d2",
    "test1": 27,
    "test2": 29,
    "exam": 38,
    "percentageScore": 94,
    "grade": "A",
    "remark": "Excellent",
    "teacher": "60d0fe4f5311236168a109cd",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Compile Results

- **URL**: `/results/compile/:classId/:termId`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Compile results for a class and term

#### Success Response

```json
{
  "success": true,
  "message": "Results compiled successfully"
}
```

### Add Remarks

- **URL**: `/results/:id/remarks`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Add remarks to a result

#### Request Body

```json
{
  "classTeacherRemark": "Outstanding performance. Keep it up!",
  "principalRemark": "Excellent result. Very proud of you."
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e5",
    "student": "60d0fe4f5311236168a109db",
    "class": "60d0fe4f5311236168a109d5",
    "term": "60d0fe4f5311236168a109d2",
    "totalScore": 450,
    "averageScore": 75,
    "position": 1,
    "numberOfSubjects": 6,
    "classTeacherRemark": "Outstanding performance. Keep it up!",
    "principalRemark": "Excellent result. Very proud of you.",
    "isPublished": true,
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Publish Results

- **URL**: `/results/publish/:classId/:termId`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Publish results for a class and term

#### Success Response

```json
{
  "success": true,
  "message": "Results published successfully"
}
```

### Toggle Term Scoring

- **URL**: `/results/toggle-scoring/:termId`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Toggle whether scoring is allowed for a term

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109d2",
    "name": "First Term",
    "academicSession": "60d0fe4f5311236168a109d0",
    "startDate": "2022-09-05T00:00:00.000Z",
    "endDate": "2022-12-20T00:00:00.000Z",
    "allowScoring": false,
    "school": "60d0fe4f5311236168a109cc",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 10. Fee Management

### Get Fees by Term

- **URL**: `/fees/term/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Bursar
- **Description**: Get all fees for a term

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e9",
      "student": {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      },
      "term": {
        "name": "First Term"
      },
      "amount": 50000,
      "status": "Paid",
      "paidAmount": 50000,
      "paymentDate": "2022-09-10T00:00:00.000Z",
      "paymentMethod": "Bank Transfer",
      "reference": "TRF123456",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109ea",
      "student": {
        "studentId": "SCH/23/1235",
        "user": {
          "firstName": "Student",
          "lastName": "Two"
        }
      },
      "term": {
        "name": "First Term"
      },
      "amount": 50000,
      "status": "Partial",
      "paidAmount": 25000,
      "paymentDate": "2022-09-15T00:00:00.000Z",
      "paymentMethod": "Cash",
      "reference": "CSH123456",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Fees by Student

- **URL**: `/fees/student/:studentId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Bursar/Student
- **Description**: Get all fees for a student

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e9",
      "student": {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      },
      "term": {
        "name": "First Term"
      },
      "amount": 50000,
      "status": "Paid",
      "paidAmount": 50000,
      "paymentDate": "2022-09-10T00:00:00.000Z",
      "paymentMethod": "Bank Transfer",
      "reference": "TRF123456",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109eb",
      "student": {
        "studentId": "SCH/23/1234",
        "user": {
          "firstName": "Student",
          "lastName": "One"
        }
      },
      "term": {
        "name": "Second Term"
      },
      "amount": 50000,
      "status": "Unpaid",
      "paidAmount": 0,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Fee

- **URL**: `/fees/:id`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Bursar/Student
- **Description**: Get a single fee by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109e9",
    "student": {
      "studentId": "SCH/23/1234",
      "user": {
        "firstName": "Student",
        "lastName": "One"
      }
    },
    "term": {
      "name": "First Term"
    },
    "amount": 50000,
    "status": "Paid",
    "paidAmount": 50000,
    "paymentDate": "2022-09-10T00:00:00.000Z",
    "paymentMethod": "Bank Transfer",
    "reference": "TRF123456",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Fee

- **URL**: `/fees`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin/Bursar
- **Description**: Create a new fee

#### Request Body

```json
{
  "student": "60d0fe4f5311236168a109dd",
  "term": "60d0fe4f5311236168a109d2",
  "amount": 50000
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ec",
    "student": "60d0fe4f5311236168a109dd",
    "term": "60d0fe4f5311236168a109d2",
    "amount": 50000,
    "status": "Unpaid",
    "paidAmount": 0,
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Fee

- **URL**: `/fees/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin/Bursar
- **Description**: Update a fee

#### Request Body

```json
{
  "amount": 55000
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ec",
    "student": "60d0fe4f5311236168a109dd",
    "term": "60d0fe4f5311236168a109d2",
    "amount": 55000,
    "status": "Unpaid",
    "paidAmount": 0,
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Fee

- **URL**: `/fees/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin/Bursar
- **Description**: Delete a fee

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Update Fee Status

- **URL**: `/fees/:id/status`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin/Bursar
- **Description**: Update a fee's status

#### Request Body

```json
{
  "status": "Paid",
  "paidAmount": 55000,
  "paymentMethod": "Online Payment",
  "reference": "ONL123456"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ec",
    "student": "60d0fe4f5311236168a109dd",
    "term": "60d0fe4f5311236168a109d2",
    "amount": 55000,
    "status": "Paid",
    "paidAmount": 55000,
    "paymentDate": "2023-01-01T00:00:00.000Z",
    "paymentMethod": "Online Payment",
    "reference": "ONL123456",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

---

## 11. Attendance Management

### Mark Attendance

- **URL**: `/attendance`
- **Method**: `POST`
- **Access**: Private/Teacher/ClassTeacher
- **Description**: Mark attendance for a student

#### Request Body

```json
{
  "student": "60d0fe4f5311236168a109db",
  "date": "2022-09-15",
  "status": "Present",
  "term": "60d0fe4f5311236168a109d2",
  "remark": "Arrived on time"
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ed",
    "student": "60d0fe4f5311236168a109db",
    "class": "60d0fe4f5311236168a109d5",
    "date": "2022-09-15T00:00:00.000Z",
    "status": "Present",
    "term": "60d0fe4f5311236168a109d2",
    "remark": "Arrived on time",
    "markedBy": "60d0fe4f5311236168a109cd",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Mark Bulk Attendance

- **URL**: `/attendance/bulk`
- **Method**: `POST`
- **Access**: Private/Teacher/ClassTeacher
- **Description**: Mark attendance for multiple students

#### Request Body

```json
{
  "classId": "60d0fe4f5311236168a109d5",
  "date": "2022-09-16",
  "term": "60d0fe4f5311236168a109d2",
  "attendanceData": [
    {
      "student": "60d0fe4f5311236168a109db",
      "status": "Present",
      "remark": "Arrived on time"
    },
    {
      "student": "60d0fe4f5311236168a109dc",
      "status": "Absent",
      "remark": "Sick leave"
    }
  ]
}
```

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109ee",
      "student": "60d0fe4f5311236168a109db",
      "class": "60d0fe4f5311236168a109d5",
      "date": "2022-09-16T00:00:00.000Z",
      "status": "Present",
      "term": "60d0fe4f5311236168a109d2",
      "remark": "Arrived on time",
      "markedBy": "60d0fe4f5311236168a109cd",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109ef",
      "student": "60d0fe4f5311236168a109dc",
      "class": "60d0fe4f5311236168a109d5",
      "date": "2022-09-16T00:00:00.000Z",
      "status": "Absent",
      "term": "60d0fe4f5311236168a109d2",
      "remark": "Sick leave",
      "markedBy": "60d0fe4f5311236168a109cd",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Class Attendance

- **URL**: `/attendance/class/:classId/date/:date`
- **Method**: `GET`
- **Access**: Private/Teacher/ClassTeacher/SchoolAdmin
- **Description**: Get attendance for a class on a specific date

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "student": {
        "_id": "60d0fe4f5311236168a109db",
        "studentId": "SCH/23/1234",
        "name": "Student One"
      },
      "attendance": {
        "_id": "60d0fe4f5311236168a109ee",
        "status": "Present",
        "remark": "Arrived on time"
      }
    },
    {
      "student": {
        "_id": "60d0fe4f5311236168a109dc",
        "studentId": "SCH/23/1235",
        "name": "Student Two"
      },
      "attendance": {
        "_id": "60d0fe4f5311236168a109ef",
        "status": "Absent",
        "remark": "Sick leave"
      }
    }
  ]
}
```

### Get Student Term Attendance

- **URL**: `/attendance/student/:studentId/term/:termId`
- **Method**: `GET`
- **Access**: Private/Teacher/ClassTeacher/SchoolAdmin/Parent/Student
- **Description**: Get attendance for a student in a term

#### Success Response

```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "60d0fe4f5311236168a109db",
      "studentId": "SCH/23/1234"
    },
    "term": {
      "_id": "60d0fe4f5311236168a109d2",
      "name": "First Term"
    },
    "statistics": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "lateDays": 0,
      "excusedDays": 0,
      "attendancePercentage": "90.00"
    },
    "records": [
      {
        "_id": "60d0fe4f5311236168a109ed",
        "student": "60d0fe4f5311236168a109db",
        "class": "60d0fe4f5311236168a109d5",
        "date": "2022-09-15T00:00:00.000Z",
        "status": "Present",
        "term": "60d0fe4f5311236168a109d2",
        "remark": "Arrived on time",
        "markedBy": {
          "firstName": "User",
          "lastName": "Name"
        },
        "school": "60d0fe4f5311236168a109cc",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      },
      {
        "_id": "60d0fe4f5311236168a109ee",
        "student": "60d0fe4f5311236168a109db",
        "class": "60d0fe4f5311236168a109d5",
        "date": "2022-09-16T00:00:00.000Z",
        "status": "Present",
        "term": "60d0fe4f5311236168a109d2",
        "remark": "Arrived on time",
        "markedBy": {
          "firstName": "User",
          "lastName": "Name"
        },
        "school": "60d0fe4f5311236168a109cc",
        "createdAt": "2023-01-01T00:  "Name"
        },
        "school": "60d0fe4f5311236168a109cc",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Class Attendance Report

- **URL**: `/attendance/report/class/:classId/term/:termId`
- **Method**: `GET`
- **Access**: Private/Teacher/ClassTeacher/SchoolAdmin
- **Description**: Get attendance report for a class in a term

#### Success Response

```json
{
  "success": true,
  "data": {
    "class": {
      "_id": "60d0fe4f5311236168a109d5",
      "name": "JSS 1A"
    },
    "term": {
      "_id": "60d0fe4f5311236168a109d2",
      "name": "First Term"
    },
    "totalSchoolDays": 20,
    "studentReports": [
      {
        "student": {
          "_id": "60d0fe4f5311236168a109db",
          "studentId": "SCH/23/1234",
          "name": "Student One"
        },
        "statistics": {
          "totalDays": 20,
          "presentDays": 18,
          "absentDays": 2,
          "lateDays": 0,
          "excusedDays": 0,
          "attendancePercentage": "90.00"
        }
      },
      {
        "student": {
          "_id": "60d0fe4f5311236168a109dc",
          "studentId": "SCH/23/1235",
          "name": "Student Two"
        },
        "statistics": {
          "totalDays": 20,
          "presentDays": 15,
          "absentDays": 3,
          "lateDays": 2,
          "excusedDays": 0,
          "attendancePercentage": "75.00"
        }
      }
    ]
  }
}
```

### Delete Attendance

- **URL**: `/attendance/:id`
- **Method**: `DELETE`
- **Access**: Private/Teacher/ClassTeacher/SchoolAdmin
- **Description**: Delete an attendance record

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## 12. Report Generation

### Generate Student Result Report

- **URL**: `/reports/student/:studentId/result/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher/Student/Parent
- **Description**: Generate a PDF report of a student's result for a term

#### Success Response

A PDF file will be downloaded with the student's result report.

### Generate Student Attendance Report

- **URL**: `/reports/student/:studentId/attendance/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/Teacher/ClassTeacher/Student/Parent
- **Description**: Generate a PDF report of a student's attendance for a term

#### Success Response

A PDF file will be downloaded with the student's attendance report.

### Generate Class Result Report

- **URL**: `/reports/class/:classId/results/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Generate a PDF report of all results for a class in a term

#### Success Response

A PDF file will be downloaded with the class result report.

### Generate Class Attendance Report

- **URL**: `/reports/class/:classId/attendance/:termId`
- **Method**: `GET`
- **Access**: Private/SchoolAdmin/ClassTeacher
- **Description**: Generate a PDF report of attendance for a class in a term

#### Success Response

A PDF file will be downloaded with the class attendance report.

---

## 13. Notification System

### Get User Notifications

- **URL**: `/notifications`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get all notifications for the current user

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Number of notifications per page (default: 20)
- `read`: Filter by read status (true/false)
- `type`: Filter by notification type

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 20
    }
  },
  "total": 25,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109f0",
      "recipient": "60d0fe4f5311236168a109e4",
      "sender": {
        "firstName": "User",
        "lastName": "Name",
        "role": "class_teacher"
      },
      "type": "attendance",
      "title": "Absent Notification: Student One",
      "message": "Your child was marked as Absent on 2022-09-20. Remark: Sick leave",
      "read": false,
      "relatedId": "60d0fe4f5311236168a109f1",
      "relatedModel": "Attendance",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109f2",
      "recipient": "60d0fe4f5311236168a109e4",
      "sender": {
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "school_admin"
      },
      "type": "result",
      "title": "Results Published: JSS 1A - First Term",
      "message": "The results for JSS 1A for First Term have been published. You can now view your child's results.",
      "read": true,
      "relatedId": "60d0fe4f5311236168a109d5",
      "relatedModel": "Class",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Unread Notification Count

- **URL**: `/notifications/unread-count`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get the count of unread notifications for the current user

#### Success Response

```json
{
  "success": true,
  "count": 5
}
```

### Mark Notification as Read

- **URL**: `/notifications/:id/read`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Mark a notification as read

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109f0",
    "recipient": "60d0fe4f5311236168a109e4",
    "sender": "60d0fe4f5311236168a109cd",
    "type": "attendance",
    "title": "Absent Notification: Student One",
    "message": "Your child was marked as Absent on 2022-09-20. Remark: Sick leave",
    "read": true,
    "relatedId": "60d0fe4f5311236168a109f1",
    "relatedModel": "Attendance",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Mark All Notifications as Read

- **URL**: `/notifications/mark-all-read`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Mark all notifications as read for the current user

#### Success Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Delete Notification

- **URL**: `/notifications/:id`
- **Method**: `DELETE`
- **Access**: Private
- **Description**: Delete a notification

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Delete All Notifications

- **URL**: `/notifications`
- **Method**: `DELETE`
- **Access**: Private
- **Description**: Delete all notifications for the current user

#### Success Response

```json
{
  "success": true,
  "message": "All notifications deleted"
}
```

### Send Notification

- **URL**: `/notifications/send`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Send a notification to users

#### Request Body

```json
{
  "recipients": {
    "role": "parent"
  },
  "type": "announcement",
  "title": "School Closure",
  "message": "The school will be closed on Friday, October 20, 2023, for staff development.",
  "sendEmail": true
}
```

#### Success Response

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109f3",
      "recipient": "60d0fe4f5311236168a109e4",
      "sender": "60d0fe4f5311236168a109cb",
      "type": "announcement",
      "title": "School Closure",
      "message": "The school will be closed on Friday, October 20, 2023, for staff development.",
      "read": false,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109f4",
      "recipient": "60d0fe4f5311236168a109e3",
      "sender": "60d0fe4f5311236168a109cb",
      "type": "announcement",
      "title": "School Closure",
      "message": "The school will be closed on Friday, October 20, 2023, for staff development.",
      "read": false,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109f5",
      "recipient": "60d0fe4f5311236168a109e0",
      "sender": "60d0fe4f5311236168a109cb",
      "type": "announcement",
      "title": "School Closure",
      "message": "The school will be closed on Friday, October 20, 2023, for staff development.",
      "read": false,
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 14. Event Management

### Get Events

- **URL**: `/events`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get all events for the current user's school

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Number of events per page (default: 10)
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `eventType`: Filter by event type

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "total": 15,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109f6",
      "title": "Parent-Teacher Meeting",
      "description": "Annual parent-teacher meeting to discuss student progress",
      "startDate": "2022-10-15T09:00:00.000Z",
      "endDate": "2022-10-15T12:00:00.000Z",
      "location": "School Hall",
      "eventType": "meeting",
      "targetAudience": ["parents", "teachers"],
      "classes": [
        {
          "name": "JSS 1A"
        },
        {
          "name": "JSS 1B"
        }
      ],
      "createdBy": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109f7",
      "title": "Mid-Term Break",
      "description": "School will be closed for mid-term break",
      "startDate": "2022-10-20T00:00:00.000Z",
      "endDate": "2022-10-24T00:00:00.000Z",
      "eventType": "holiday",
      "targetAudience": ["all"],
      "createdBy": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Event

- **URL**: `/events/:id`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get a single event by ID

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109f6",
    "title": "Parent-Teacher Meeting",
    "description": "Annual parent-teacher meeting to discuss student progress",
    "startDate": "2022-10-15T09:00:00.000Z",
    "endDate": "2022-10-15T12:00:00.000Z",
    "location": "School Hall",
    "eventType": "meeting",
    "targetAudience": ["parents", "teachers"],
    "classes": [
      {
        "name": "JSS 1A"
      },
      {
        "name": "JSS 1B"
      }
    ],
    "createdBy": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Create Event

- **URL**: `/events`
- **Method**: `POST`
- **Access**: Private/SchoolAdmin
- **Description**: Create a new event

#### Request Body

```json
{
  "title": "End of Term Examination",
  "description": "First term examination for all classes",
  "startDate": "2022-12-01",
  "endDate": "2022-12-10",
  "location": "School Premises",
  "eventType": "exam",
  "targetAudience": ["students", "teachers"],
  "classes": ["60d0fe4f5311236168a109d5", "60d0fe4f5311236168a109d6"],
  "sendEmail": true
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109f8",
    "title": "End of Term Examination",
    "description": "First term examination for all classes",
    "startDate": "2022-12-01T00:00:00.000Z",
    "endDate": "2022-12-10T00:00:00.000Z",
    "location": "School Premises",
    "eventType": "exam",
    "targetAudience": ["students", "teachers"],
    "classes": ["60d0fe4f5311236168a109d5", "60d0fe4f5311236168a109d6"],
    "createdBy": "60d0fe4f5311236168a109cb",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Update Event

- **URL**: `/events/:id`
- **Method**: `PUT`
- **Access**: Private/SchoolAdmin
- **Description**: Update an event

#### Request Body

```json
{
  "title": "Updated End of Term Examination",
  "startDate": "2022-12-05",
  "endDate": "2022-12-15",
  "sendUpdateNotification": true
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109f8",
    "title": "Updated End of Term Examination",
    "description": "First term examination for all classes",
    "startDate": "2022-12-05T00:00:00.000Z",
    "endDate": "2022-12-15T00:00:00.000Z",
    "location": "School Premises",
    "eventType": "exam",
    "targetAudience": ["students", "teachers"],
    "classes": ["60d0fe4f5311236168a109d5", "60d0fe4f5311236168a109d6"],
    "createdBy": "60d0fe4f5311236168a109cb",
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Delete Event

- **URL**: `/events/:id`
- **Method**: `DELETE`
- **Access**: Private/SchoolAdmin
- **Description**: Delete an event

#### Success Response

```json
{
  "success": true,
  "data": {}
}
```

### Get Upcoming Events

- **URL**: `/events/upcoming`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get upcoming events for the current user

#### Query Parameters

- `limit`: Number of events to return (default: 5)

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109f6",
      "title": "Parent-Teacher Meeting",
      "description": "Annual parent-teacher meeting to discuss student progress",
      "startDate": "2022-10-15T09:00:00.000Z",
      "endDate": "2022-10-15T12:00:00.000Z",
      "location": "School Hall",
      "eventType": "meeting",
      "targetAudience": ["parents", "teachers"],
      "classes": [
        {
          "name": "JSS 1A"
        },
        {
          "name": "JSS 1B"
        }
      ],
      "createdBy": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109f7",
      "title": "Mid-Term Break",
      "description": "School will be closed for mid-term break",
      "startDate": "2022-10-20T00:00:00.000Z",
      "endDate": "2022-10-24T00:00:00.000Z",
      "eventType": "holiday",
      "targetAudience": ["all"],
      "createdBy": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 15. Messaging System

### Send Message

- **URL**: `/messages`
- **Method**: `POST`
- **Access**: Private
- **Description**: Send a message to another user

#### Request Body

```json
{
  "recipientId": "60d0fe4f5311236168a109e4",
  "content": "Hello, I would like to discuss your child's progress in Mathematics.",
  "subject": "Student Progress Discussion",
  "studentIds": ["60d0fe4f5311236168a109db"],
  "sendEmail": true
}
```

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109f9",
    "sender": "60d0fe4f5311236168a109cd",
    "recipient": "60d0fe4f5311236168a109e4",
    "conversationId": "60d0fe4f5311236168a109cd_60d0fe4f5311236168a109e4",
    "content": "Hello, I would like to discuss your child's progress in Mathematics.",
    "read": false,
    "attachments": [],
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Conversations

- **URL**: `/messages/conversations`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get all conversations for the current user

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Number of conversations per page (default: 10)
- `archived`: Filter by archived status (true/false)

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 10
    }
  },
  "total": 15,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109fa",
      "otherParticipant": {
        "_id": "60d0fe4f5311236168a109e4",
        "firstName": "Parent",
        "lastName": "One",
        "role": "parent"
      },
      "subject": "Student Progress Discussion",
      "lastMessage": {
        "content": "Hello, I would like to discuss your child's progress in Mathematics.",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "read": false
      },
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "isArchived": false
    },
    {
      "_id": "60d0fe4f5311236168a109fb",
      "otherParticipant": {
        "_id": "60d0fe4f5311236168a109e3",
        "firstName": "Parent",
        "lastName": "Three",
        "role": "parent"
      },
      "subject": "Attendance Concern",
      "lastMessage": {
        "content": "I noticed your child has been absent frequently. Is everything okay?",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "read": true
      },
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "isArchived": false
    }
  ]
}
```

### Get Conversation Messages

- **URL**: `/messages/conversations/:conversationId`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get all messages for a conversation

#### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Number of messages per page (default: 20)

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 20
    }
  },
  "total": 25,
  "conversation": {
    "_id": "60d0fe4f5311236168a109fa",
    "subject": "Student Progress Discussion",
    "otherParticipant": {
      "_id": "60d0fe4f5311236168a109e4",
      "firstName": "Parent",
      "lastName": "One",
      "role": "parent"
    },
    "isArchived": false
  },
  "data": [
    {
      "_id": "60d0fe4f5311236168a109fc",
      "sender": {
        "_id": "60d0fe4f5311236168a109cd",
        "firstName": "User",
        "lastName": "Name",
        "role": "class_teacher"
      },
      "conversationId": "60d0fe4f5311236168a109cd_60d0fe4f5311236168a109e4",
      "content": "Hello, I would like to discuss your child's progress in Mathematics.",
      "read": true,
      "attachments": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "60d0fe4f5311236168a109fd",
      "sender": {
        "_id": "60d0fe4f5311236168a109e4",
        "firstName": "Parent",
        "lastName": "One",
        "role": "parent"
      },
      "conversationId": "60d0fe4f5311236168a109cd_60d0fe4f5311236168a109e4",
      "content": "Hello, thank you for reaching out. I'm available for a meeting anytime this week.",
      "read": false,
      "attachments": [],
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Unread Message Count

- **URL**: `/messages/unread-count`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get the count of unread messages for the current user

#### Success Response

```json
{
  "success": true,
  "count": 3
}
```

### Mark Message as Read

- **URL**: `/messages/:id/read`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Mark a message as read

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109fd",
    "sender": "60d0fe4f5311236168a109e4",
    "recipient": "60d0fe4f5311236168a109cd",
    "conversationId": "60d0fe4f5311236168a109cd_60d0fe4f5311236168a109e4",
    "content": "Hello, thank you for reaching out. I'm available for a meeting anytime this week.",
    "read": true,
    "attachments": [],
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Archive/Unarchive Conversation

- **URL**: `/messages/conversations/:id/archive`
- **Method**: `PUT`
- **Access**: Private
- **Description**: Archive or unarchive a conversation

#### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109fa",
    "participants": ["60d0fe4f5311236168a109cd", "60d0fe4f5311236168a109e4"],
    "lastMessage": "60d0fe4f5311236168a109fc",
    "subject": "Student Progress Discussion",
    "isArchived": true,
    "school": "60d0fe4f5311236168a109cc",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Get Contacts

- **URL**: `/messages/contacts`
- **Method**: `GET`
- **Access**: Private
- **Description**: Get all contacts that the current user can message

#### Query Parameters

- `role`: Filter contacts by role

#### Success Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109e4",
      "firstName": "Parent",
      "lastName": "One",
      "role": "parent"
    },
    {
      "_id": "60d0fe4f5311236168a109e3",
      "firstName": "Parent",
      "lastName": "Three",
      "role": "parent"
    }
  ]
}
```

---

## 16. Dashboard

### Get Parent Dashboard

- **URL**: `/dashboard/parent`
- **Method**: `GET`
- **Access**: Private/Parent
- **Description**: Get dashboard data for a parent

#### Success Response

```json
{
  "success": true,
  "data": {
    "parent": {
      "_id": "60d0fe4f5311236168a109e0",
      "user": "60d0fe4f5311236168a109e4",
      "children": ["60d0fe4f5311236168a109db"],
      "relationship": "Father",
      "school": "60d0fe4f5311236168a109cc",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    "children": [
      {
        "student": {
          "_id": "60d0fe4f5311236168a109db",
          "studentId": "SCH/23/1234",
          "user": {
            "firstName": "Student",
            "lastName": "One"
          },
          "class": {
            "name": "JSS 1A"
          }
        },
        "latestResult": {
          "_id": "60  {
            "name": "JSS 1A"
          }
        },
        "latestResult": {
          "_id": "60d0fe4f5311236168a109e5",
          "term": {
            "name": "First Term"
          },
          "averageScore": 75,
          "position": 1
        },
        "attendance": {
          "totalDays": 20,
          "presentDays": 18,
          "absentDays": 2,
          "attendancePercentage": "90.00"
        }
      }
    ],
    "unreadMessagesCount": 3
  }
}
```

### Get Teacher Dashboard

- **URL**: `/dashboard/teacher`
- **Method**: `GET`
- **Access**: Private/Teacher/ClassTeacher
- **Description**: Get dashboard data for a teacher

#### Success Response

```json
{
  "success": true,
  "data": {
    "classesTaught": [
      {
        "_id": "60d0fe4f5311236168a109d5",
        "name": "JSS 1A",
        "academicSession": {
          "name": "2022/2023"
        }
      }
    ],
    "subjectsTaught": [
      {
        "_id": "60d0fe4f5311236168a109d8",
        "name": "Mathematics",
        "code": "MTH101",
        "class": {
          "name": "JSS 1A"
        }
      },
      {
        "_id": "60d0fe4f5311236168a109da",
        "name": "Advanced Physics",
        "code": "PHY101",
        "class": {
          "name": "JSS 1A"
        }
      }
    ],
    "totalStudents": 15,
    "unreadMessagesCount": 2,
    "recentMessages": [
      {
        "_id": "60d0fe4f5311236168a109fd",
        "sender": {
          "firstName": "Parent",
          "lastName": "One",
          "role": "parent"
        },
        "content": "Hello, thank you for reaching out. I'm available for a meeting anytime this week.",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Child Performance

- **URL**: `/dashboard/parent/child/:studentId`
- **Method**: `GET`
- **Access**: Private/Parent
- **Description**: Get detailed performance data for a parent's child

#### Success Response

```json
{
  "success": true,
  "data": {
    "student": {
      "_id": "60d0fe4f5311236168a109db",
      "studentId": "SCH/23/1234",
      "user": {
        "firstName": "Student",
        "lastName": "One"
      },
      "class": {
        "name": "JSS 1A"
      }
    },
    "results": [
      {
        "_id": "60d0fe4f5311236168a109e5",
        "term": {
          "name": "First Term"
        },
        "class": {
          "name": "JSS 1A"
        },
        "totalScore": 450,
        "averageScore": 75,
        "position": 1,
        "numberOfSubjects": 6,
        "classTeacherRemark": "Excellent performance",
        "principalRemark": "Keep it up",
        "isPublished": true
      }
    ],
    "latestTermScores": [
      {
        "_id": "60d0fe4f5311236168a109e7",
        "subject": {
          "name": "Mathematics",
          "code": "MTH101"
        },
        "test1": 27,
        "test2": 29,
        "exam": 38,
        "percentageScore": 94,
        "grade": "A",
        "remark": "Excellent"
      },
      {
        "_id": "60d0fe4f5311236168a109e8",
        "subject": {
          "name": "English Language",
          "code": "ENG101"
        },
        "test1": 22,
        "test2": 25,
        "exam": 30,
        "percentageScore": 77,
        "grade": "A",
        "remark": "Excellent"
      }
    ],
    "attendance": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "lateDays": 0,
      "excusedDays": 0,
      "attendancePercentage": "90.00",
      "recentRecords": [
        {
          "_id": "60d0fe4f5311236168a109ee",
          "date": "2022-09-16T00:00:00.000Z",
          "status": "Present",
          "remark": "Arrived on time"
        },
        {
          "_id": "60d0fe4f5311236168a109ed",
          "date": "2022-09-15T00:00:00.000Z",
          "status": "Present",
          "remark": "Arrived on time"
        }
      ]
    },
    "teachers": [
      {
        "_id": "60d0fe4f5311236168a109cd",
        "firstName": "User",
        "lastName": "Name",
        "role": "class_teacher"
      },
      {
        "_id": "60d0fe4f5311236168a109cf",
        "firstName": "New",
        "lastName": "Teacher",
        "role": "teacher"
      }
    ]
  }
}
```

### Get Children Comparison

- **URL**: `/dashboard/parent/children-comparison`
- **Method**: `GET`
- **Access**: Private/Parent
- **Description**: Get comparison data for a parent's children

#### Success Response

```json
{
  "success": true,
  "data": [
    {
      "student": {
        "id": "60d0fe4f5311236168a109db",
        "name": "Student One",
        "class": "JSS 1A"
      },
      "term": "First Term",
      "averageScore": 75,
      "position": 1,
      "attendance": {
        "totalDays": 20,
        "presentDays": 18,
        "attendancePercentage": "90.00"
      },
      "subjectScores": [
        {
          "subject": "Mathematics",
          "percentageScore": 94,
          "grade": "A"
        },
        {
          "subject": "English Language",
          "percentageScore": 77,
          "grade": "A"
        }
      ]
    },
    {
      "student": {
        "id": "60d0fe4f5311236168a109dc",
        "name": "Student Two",
        "class": "JSS 1B"
      },
      "term": "First Term",
      "averageScore": 70,
      "position": 2,
      "attendance": {
        "totalDays": 20,
        "presentDays": 15,
        "attendancePercentage": "75.00"
      },
      "subjectScores": [
        {
          "subject": "Mathematics",
          "percentageScore": 85,
          "grade": "A"
        },
        {
          "subject": "English Language",
          "percentageScore": 65,
          "grade": "B"
        }
      ]
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide required fields"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "User role teacher is not authorized to access this route"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found with id of 60d0fe4f5311236168a109xx"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Server Error",
  "stack": "Error stack trace (only in development mode)"
}
```

---

This documentation provides a comprehensive reference for all endpoints in the GradeFlow API, including the newly implemented messaging system. Each endpoint includes sample requests and responses to help developers understand how to interact with the API.
