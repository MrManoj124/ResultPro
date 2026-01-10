# API Testing Guide - cURL Examples

## Prerequisites
- Backend server running on `http://localhost:5000`
- MongoDB running and connected
- Faculties seeded: `npm run seed-faculties`

---

## Type Collection - Example Requests

### 1. Create Type Course - Business Management Fundamentals
```bash
curl -X POST http://localhost:5000/api/type \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Business Management Fundamentals",
    "courseCode": "BUS101",
    "courseUnit": 3,
    "semester": "First",
    "level": "Level 1",
    "faculty": "Business",
    "department": "Business Management Department",
    "description": "Introduction to business management concepts"
  }'
```

### 2. Create Type Course - Banking Principles
```bash
curl -X POST http://localhost:5000/api/type \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Banking Principles",
    "courseCode": "BAN101",
    "courseUnit": 3,
    "semester": "First",
    "level": "Level 1",
    "faculty": "Business",
    "department": "Banking Insurance Department",
    "description": "Fundamentals of banking and financial systems"
  }'
```

### 3. Create Type Course - ICT Fundamentals
```bash
curl -X POST http://localhost:5000/api/type \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "ICT Fundamentals",
    "courseCode": "ICT101",
    "courseUnit": 4,
    "semester": "First",
    "level": "Level 1",
    "faculty": "Applied Science",
    "department": "Physical Science Department",
    "subDepartment": "Information and Communication Technology",
    "description": "Introduction to Information and Communication Technology"
  }'
```

### 4. Get All Type Courses
```bash
curl -X GET http://localhost:5000/api/type
```

### 5. Get Type Courses - Business Faculty Only
```bash
curl -X GET "http://localhost:5000/api/type?faculty=Business"
```

### 6. Get Type Courses - Business Management Department
```bash
curl -X GET "http://localhost:5000/api/type?department=Business%20Management%20Department"
```

### 7. Get Type Courses - First Semester
```bash
curl -X GET "http://localhost:5000/api/type?semester=First"
```

### 8. Get Type Course by ID
```bash
curl -X GET http://localhost:5000/api/type/[TYPE_ID]
# Replace [TYPE_ID] with actual MongoDB ID from creation response
```

### 9. Get Courses by Faculty Name
```bash
curl -X GET http://localhost:5000/api/type/faculty/Business
```

### 10. Get Courses by Department Name
```bash
curl -X GET "http://localhost:5000/api/type/department/Business%20Management%20Department"
```

### 11. Update Type Course
```bash
curl -X PUT http://localhost:5000/api/type/[TYPE_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "courseUnit": 4,
    "description": "Updated description"
  }'
```

### 12. Delete Type Course
```bash
curl -X DELETE http://localhost:5000/api/type/[TYPE_ID]
```

---

## Syllabus Collection - Example Requests

**Note**: Before creating Syllabus records, you need:
1. Type IDs (from Type collection)
2. Staff IDs (from Staff collection)
3. Student IDs (from Student collection)
4. Course IDs (from Course collection)

### 1. Create Single Syllabus Record
```bash
curl -X POST http://localhost:5000/api/syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": "65abc123...",
    "staffId": "65staff1...",
    "studentId": "65student1...",
    "courseId": "65course1...",
    "attendance": 0
  }'
```

### 2. Bulk Assign Students to Course
```bash
curl -X POST http://localhost:5000/api/syllabus/bulk-assign \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": "65abc123...",
    "staffId": "65staff1...",
    "courseId": "65course1...",
    "studentIds": [
      "65student1...",
      "65student2...",
      "65student3..."
    ]
  }'
```

### 3. Get All Syllabus Records
```bash
curl -X GET http://localhost:5000/api/syllabus
```

### 4. Get Student's Course Assignments
```bash
curl -X GET http://localhost:5000/api/syllabus/student/[STUDENT_ID]
```

### 5. Get Staff's Assigned Courses
```bash
curl -X GET http://localhost:5000/api/syllabus/staff/[STAFF_ID]
```

### 6. Get Syllabus by ID
```bash
curl -X GET http://localhost:5000/api/syllabus/[SYLLABUS_ID]
```

### 7. Update Marks and Grades
```bash
curl -X PUT http://localhost:5000/api/syllabus/[SYLLABUS_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "marks": 85,
    "grade": "A-",
    "gpa": 3.7,
    "attendance": 95,
    "status": "Completed"
  }'
```

### 8. Update Only Attendance
```bash
curl -X PUT http://localhost:5000/api/syllabus/[SYLLABUS_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "attendance": 92
  }'
```

### 9. Change Course Status
```bash
curl -X PUT http://localhost:5000/api/syllabus/[SYLLABUS_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Dropped"
  }'
```

### 10. Get Syllabus Records with Filters
```bash
curl -X GET "http://localhost:5000/api/syllabus?studentId=[ID]&status=Active"
```

### 11. Delete Syllabus Record
```bash
curl -X DELETE http://localhost:5000/api/syllabus/[SYLLABUS_ID]
```

---

## Helpful Commands

### 1. Get Student IDs (from Student collection)
```bash
curl -X GET http://localhost:5000/api/students
```

### 2. Get Staff IDs (from Staff collection)
```bash
curl -X GET http://localhost:5000/api/staff
```

### 3. Get Course IDs (from Course collection)
```bash
curl -X GET http://localhost:5000/api/courses
```

### 4. Format JSON Output (Linux/Mac)
```bash
curl -X GET http://localhost:5000/api/type | jq .
```

---

## Testing Workflow

### Complete Flow Example

**Step 1**: Create a Type course
```bash
TYPE_RESPONSE=$(curl -s -X POST http://localhost:5000/api/type \
  -H "Content-Type: application/json" \
  -d '{
    "courseName": "Business Management Fundamentals",
    "courseCode": "BUS101",
    "courseUnit": 3,
    "semester": "First",
    "level": "Level 1",
    "faculty": "Business",
    "department": "Business Management Department"
  }')

# Extract Type ID (use jq on Linux/Mac)
TYPE_ID=$(echo $TYPE_RESPONSE | jq -r '.data._id')
```

**Step 2**: Get Staff ID
```bash
curl -X GET http://localhost:5000/api/staff
# Copy a staff ID from response
```

**Step 3**: Get Student ID
```bash
curl -X GET http://localhost:5000/api/students
# Copy a student ID from response
```

**Step 4**: Get Course ID
```bash
curl -X GET http://localhost:5000/api/courses
# Copy a course ID from response
```

**Step 5**: Create Syllabus record
```bash
curl -X POST http://localhost:5000/api/syllabus \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": "[TYPE_ID_FROM_STEP1]",
    "staffId": "[STAFF_ID]",
    "studentId": "[STUDENT_ID]",
    "courseId": "[COURSE_ID]",
    "attendance": 95
  }'
```

**Step 6**: Update marks
```bash
curl -X PUT http://localhost:5000/api/syllabus/[SYLLABUS_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "marks": 85,
    "grade": "A-",
    "gpa": 3.7,
    "status": "Completed"
  }'
```

---

## Using Postman (Alternative to cURL)

1. **Import requests**: Create a new Postman collection
2. **Set variable**: `{{BASE_URL}}` = `http://localhost:5000`
3. **Create requests**:
   - POST `/api/type` - Create courses
   - POST `/api/syllabus/bulk-assign` - Assign students
   - PUT `/api/syllabus/:id` - Update grades
   - GET `/api/syllabus/student/:studentId` - View courses

---

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "param": "courseCode",
      "msg": "Course code already exists"
    }
  ]
}
```

### Missing Field
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "param": "courseName",
      "msg": "Course name is required"
    }
  ]
}
```

### Not Found
```json
{
  "success": false,
  "message": "Type course not found"
}
```

---

## Tips

- Replace `[PLACEHOLDER]` with actual IDs
- Use `jq` on Linux/Mac for readable JSON output
- Store IDs in variables for easier workflow
- Test one endpoint at a time
- Check error messages if request fails
