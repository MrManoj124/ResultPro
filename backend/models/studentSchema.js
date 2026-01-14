const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    regNumber: {
      type: String,
      required: true,
      trim: true,
    },
    indexNumber: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      trim: true,
    },
    nic: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: String, // Could be Date, but keeping String for compatibility with existing code
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    faculty: {
      type: String,
      required: true,
      // enum: ["Applied", "Business Studies", "Technology Studies"], // Removed enum to avoid validation errors with "Applied Science" vs "Applied" mismatch
    },
    department: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: "student",
    },
    mobile: String,
    address: String,
    gender: String,
    birthdate: String,
    level: String,
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

module.exports = Student;
