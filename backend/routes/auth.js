/*const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const Student = require("../models/studentSchema");
const Admin = require("../models/admin");

router.post("/signup", async (req, res) => {
  try {
    const {
      regNumber,
      fullName, // Mapping to 'name'
      enrollDate, // Mapping to 'enrollmentDate'
      indexNumber,
      academicYear,
      faculty,
      username,
      password,
    } = req.body;

    // Check existing
    const existingUser = await Student.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      regNumber,
      name: fullName,
      enrollmentDate: enrollDate,
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

router.post("/login", async (req, res) => {
  try {
    const { username, password, faculty } = req.body;

    let user;
    let role;

    // 1. Admin Login (Check admin collection first if 'faculty' is missing or username is 'admin')
    if (!faculty || username === "admin") {
      user = await Admin.findOne({ username });
      if (user) {
        role = "admin";
      }
    }

    // 2. Student Login (Check student collection if not found as admin)
    if (!user) {
      user = await Student.findOne({ username });
      if (user) {
        role = user.role || "student";
        // Optional: Check if faculty matches?
        // if (faculty && user.faculty !== faculty) ...
      }
    }

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: role, faculty: user.faculty || "Global" },
      process.env.JWT_SECRET || "fallback_secret_key_DO_NOT_USE_IN_PROD",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { _id: user._id, username: user.username, role: role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
});

module.exports = router;

