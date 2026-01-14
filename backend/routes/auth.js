const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Example: faculty databases
const faculties = {
  Applied: mongoose.connection.useDb("faculty_Applied"),
  BusinessStudies: mongoose.connection.useDb("faculty_BusinessStudies"),
  TechnologicalStudies: mongoose.connection.useDb("faculty_TechnologicalStudies"),
};

// Student Schema (shared across faculties)
const studentSchema = new mongoose.Schema({
  regNumber: String,
  fullName: String,
  enrollDate: String,
  indexNumber: String,
  academicYear: String,
  faculty: String,
  username: String,
  password: String,
  role: { type: String, default: "student" },
});

router.post("/signup", async (req, res) => {
  try {
    const {
      regNumber,
      fullName,
      enrollDate,
      indexNumber,
      academicYear,
      faculty,
      username,
      password,
    } = req.body;

    if (!faculty || !faculties[faculty]) return res.status(400).json({ message: "Invalid faculty" });

    const Student = faculties[faculty].model("Student", studentSchema);

    const existingUser = await Student.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      regNumber,
      fullName,
      enrollDate,
      indexNumber,
      academicYear,
      faculty,
      username,
      password: hashedPassword,
    });

    await newStudent.save();
    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const Admin = require("../models/admin");

// ... (existing code)

router.post("/login", async (req, res) => {
  try {
    const { username, password, faculty } = req.body;

    let user;
    let role;

    // 1. Admin Login (if no faculty provided or explicit admin check)
    if (!faculty) {
      user = await Admin.findOne({ username });
      if (!user) return res.status(400).json({ message: "User not found" });
      role = "admin";
    } else {
      // 2. Student/Faculty Login
      if (!faculties[faculty]) return res.status(400).json({ message: "Invalid faculty" });
      const Student = faculties[faculty].model("Student", studentSchema);
      user = await Student.findOne({ username });
      if (!user) return res.status(400).json({ message: "User not found" });
      role = user.role || "student";
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: role, faculty: faculty || "Global" },
      process.env.JWT_SECRET || "fallback_secret_key_DO_NOT_USE_IN_PROD",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { username: user.username, role: role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
});


module.exports = router;

