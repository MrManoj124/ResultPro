const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const Student = require("../models/studentSchema");
const Admin = require("../models/admin");
const Staff = require("../models/staffSchema");

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
      // Check for username OR regNumber
      user = await Student.findOne({
        $or: [{ username: username }, { regNumber: username }]
      });
      if (user) {
        role = user.role || "student";
        // Optional: Check if faculty matches?
        // if (faculty && user.faculty !== faculty) ...
      }
    }

    // 3. Staff Login (Check staff collection)
    if (!user) {
      // Check for username OR staffId
      user = await Staff.findOne({
        $or: [{ username: username }, { staffId: username }]
      });
      if (user) {
        role = user.role || "staff";
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
});

// Change Password Route
router.post("/change-password", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key_DO_NOT_USE_IN_PROD");
    const { currentPassword, newPassword } = req.body;
    const userId = decoded.id;
    const role = decoded.role;

    let user;
    let Model;

    if (role === "student") {
      Model = Student;
    } else if (role === "staff") {
      Model = Staff;
    } else if (role === "admin") {
      Model = Admin;
    } else {
      return res.status(400).json({ message: "Unknown role" });
    }

    user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid current password" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

