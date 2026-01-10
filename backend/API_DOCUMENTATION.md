# Syllabus & Type Collection API Documentation

## Overview
This document describes the new **Syllabus** and **Type** collection APIs that form the backbone of the Result Management System. The **Type** collection manages courses per semester, while the **Syllabus** collection serves as the main hub connecting students, staff, courses, and types.

---

## Type Collection API

### Base URL: `http://localhost:5000/api/type`

#### 1. GET All Type Courses
```
GET /
Query Parameters (optional):
  - faculty: "Business" | "Technology" | "Applied Science"
  - department: "Banking Insurance Department" | "Business Management Department" | etc.
  - semester: "First" | "Second" | "Third"
  - level: "Level 1" | "Level 2" | etc.

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65abc123...",
      "courseName": "Business Management Fundamentals",
      "courseCode": "BUS101",
      "courseUnit": 3,
      "semester": "First",
      "level": "Level 1",
      "faculty": "Business",
      "department": "Business Management Department",
      "description": "Introduction to business management concepts"
    }
  ]
}
```

#### 2. GET Type Course by ID
```
GET /:id

Response:
{
  "success": true,
  "data": { ... }
}
```

#### 3. CREATE New Type Course
```
POST /
Headers:
  Content-Type: application/json

Body:
{
  "courseName": "Business Management Fundamentals",
  "courseCode": "BUS101",
  "courseUnit": 3,
  "semester": "First",
  "level": "Level 1",
  "faculty": "Business",
  "department": "Business Management Department",
  "subDepartment": "Optional",
  "description": "Introduction to business management concepts",
  "prerequisites": [] // Array of Type IDs
}

Response: 201 Created
{
  "success": true,
  "message": "Type course created successfully",
  "data": { ... }
}
```

#### 4. UPDATE Type Course
```
PUT /:id
Body: (Any fields to update)
{
  "courseName": "Updated Course Name",
  "courseUnit": 4
}

Response:
{
  "success": true,
  "message": "Type course updated successfully",
  "data": { ... }
}
```

#### 5. DELETE Type Course
```
DELETE /:id

Response:
{
  "success": true,
  "message": "Type course deleted successfully",
  "data": { ... }
}
```

#### 6. GET Courses by Faculty
```
GET /faculty/:facultyName
Example: GET /faculty/Business

Response:
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

#### 7. GET Courses by Department
```
GET /department/:departmentName
Example: GET /department/Business Management Department

Response:
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

---

## Syllabus Collection API

### Base URL: `http://localhost:5000/api/syllabus`

The Syllabus collection is the **MAIN HUB** connecting:
- **typeId** → Type collection (course per semester)
- **staffId** → Staff collection (instructor)
- **studentId** → Student collection (learner)
- **courseId** → Course collection (course details)

#### 1. GET All Syllabus Records
```
GET /
Query Parameters (optional):
  - studentId: "Student MongoDB ID"
  - staffId: "Staff MongoDB ID"
  - typeId: "Type MongoDB ID"
  - status: "Active" | "Completed" | "Dropped" | "Pending"

Response:
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "65def456...",
      "typeId": {
        "_id": "65abc123...",
        "courseName": "Business Management Fundamentals",
        "courseCode": "BUS101",
        "semester": "First",
        "level": "Level 1",
        "faculty": "Business",
        "department": "Business Management Department"
      },
      "staffId": {
        "_id": "65staff1...",
        "name": "Dr. John Smith",
        "email": "john@university.edu",
        "department": "Business Management Department"
      },
      "studentId": {
        "_id": "65student1...",
        "name": "Alice Johnson",
        "username": "student001",
        "faculty": "Business",
        "department": "Business Management Department"
      },
      "courseId": {
        "_id": "65course1...",
        "courseName": "Business Management Fundamentals",
        "courseCode": "BUS101",
        "credits": 3
      },
      "enrollmentDate": "2024-01-11T10:00:00Z",
      "status": "Active",
      "marks": 85,
      "grade": "A-",
      "gpa": 3.7,
      "attendance": 95
    }
  ]
}
```

#### 2. GET Syllabus Record by ID
```
GET /:id

Response:
{
  "success": true,
  "data": { ... }
}
```

#### 3. CREATE New Syllabus Record
```
POST /
Body:
{
  "typeId": "Type MongoDB ID",
  "staffId": "Staff MongoDB ID",
  "studentId": "Student MongoDB ID",
  "courseId": "Course MongoDB ID",
  "attendance": 0 // Optional, default 0
}

Response: 201 Created
{
  "success": true,
  "message": "Syllabus record created successfully",
  "data": { ... }
}
```

#### 4. UPDATE Syllabus Record
```
PUT /:id
Body: (Update marks, grades, attendance, status)
{
  "marks": 85,
  "grade": "A-",
  "gpa": 3.7,
  "attendance": 95,
  "status": "Completed"
}

Response:
{
  "success": true,
  "message": "Syllabus record updated successfully",
  "data": { ... }
}
```

#### 5. DELETE Syllabus Record
```
DELETE /:id

Response:
{
  "success": true,
  "message": "Syllabus record deleted successfully",
  "data": { ... }
}
```

#### 6. GET Student's Course Assignments
```
GET /student/:studentId
Example: GET /student/65student1...

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "typeId": { ... },
      "staffId": { ... },
      "courseId": { ... },
      "marks": 85,
      "grade": "A-",
      "status": "Active"
    }
  ]
}
```

#### 7. GET Staff's Assigned Courses
```
GET /staff/:staffId
Example: GET /staff/65staff1...

Response:
{
  "success": true,
  "count": 3,
  "data": [
    {
      "typeId": { ... },
      "studentId": { ... },
      "courseId": { ... },
      "marks": 85,
      "grade": "A-"
    }
  ]
}
```

#### 8. BULK ASSIGN Students to Course
```
POST /bulk-assign
Body:
{
  "typeId": "Type MongoDB ID",
  "staffId": "Staff MongoDB ID",
  "courseId": "Course MongoDB ID",
  "studentIds": [
    "Student ID 1",
    "Student ID 2",
    "Student ID 3"
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "3 students assigned successfully",
  "assignedCount": 3,
  "errorCount": 0,
  "data": [ ... ]
}
```

---

## Database Schema Overview

### Type Collection
```javascript
{
  _id: ObjectId,
  courseName: String,      // e.g., "Business Management Fundamentals"
  courseCode: String,      // e.g., "BUS101"
  courseUnit: Number,      // e.g., 3 (credit hours)
  semester: String,        // "First" | "Second" | "Third"
  level: String,           // e.g., "Level 1"
  faculty: String,         // "Business" | "Technology" | "Applied Science"
  department: String,      // Department name
  subDepartment: String,   // Optional
  description: String,
  prerequisites: [ObjectId], // References to other Type records
  isActive: Boolean,       // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Syllabus Collection
```javascript
{
  _id: ObjectId,
  typeId: ObjectId,        // Reference to Type
  staffId: ObjectId,       // Reference to Staff
  studentId: ObjectId,     // Reference to Student
  courseId: ObjectId,      // Reference to Course
  enrollmentDate: Date,    // Default: now
  status: String,          // "Active" | "Completed" | "Dropped" | "Pending"
  marks: Number,           // 0-100
  grade: String,           // "A" | "A-" | "B+" | etc.
  gpa: Number,             // 0-4
  attendance: Number,      // 0-100 (percentage)
  createdAt: Date,
  updatedAt: Date
}
```

---

## Faculty & Department Structure

### Business Faculty
- **Banking Insurance Department**
- **Business Management Department** (5 courses)
- **Project Management Department**

### Technology Faculty
- **Technology Department**

### Applied Science Faculty
- **Bio-Science Department**
  - Sub: Biology
- **Physical Science Department**
  - Sub: Information and Communication Technology (ICT)
  - Sub: Applied Mathematical and Computer Science

---

## Example Usage Flow

### 1. Admin Creates Type Courses
```bash
POST http://localhost:5000/api/type
Body:
{
  "courseName": "Business Management Fundamentals",
  "courseCode": "BUS101",
  "courseUnit": 3,
  "semester": "First",
  "level": "Level 1",
  "faculty": "Business",
  "department": "Business Management Department"
}
```

### 2. Admin Assigns Students to Course
```bash
POST http://localhost:5000/api/syllabus/bulk-assign
Body:
{
  "typeId": "65abc123...",
  "staffId": "65staff1...",
  "courseId": "65course1...",
  "studentIds": ["65student1...", "65student2...", "65student3..."]
}
```

### 3. Staff Inputs Marks
```bash
PUT http://localhost:5000/api/syllabus/65def456...
Body:
{
  "marks": 85,
  "grade": "A-",
  "gpa": 3.7,
  "attendance": 95
}
```

### 4. Student Views Their Course Results
```bash
GET http://localhost:5000/api/syllabus/student/65student1...
```

---

## Error Handling

All endpoints return consistent error responses:

```javascript
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

---

## Notes
- All dates are in ISO 8601 format (UTC)
- MongoDB ObjectIds are automatically generated
- Validation is enforced on both frontend and backend
- Admin authorization required for create/update/delete operations
