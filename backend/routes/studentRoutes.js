// ===== routes/studentRoutes.js =====
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Student = require("../models/studentSchema");
const bcrypt = require("bcryptjs");
const DEFAULT_PASSWORD = "uov2026user"; // Updated default password

// ===== Helper: send email credentials =====
const sendCredentialsEmail = async (studentEmail, studentName, registrationNumber) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "your-email@gmail.com",
        pass: "your-app-password", // use Gmail app password
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: studentEmail,
      subject: "Your Student Account Credentials",
      html: `
        <h3>Welcome to the University Result Management System</h3>
        <p>Dear ${studentName},</p>
        <p>Your account has been created successfully.</p>
        <p><b>Username:</b> ${registrationNumber}</p>
        <p><b>Password:</b> ${DEFAULT_PASSWORD}</p>
        <p>Please change your password after your first login.</p>
        <p>Best regards,<br/>University Admin</p>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


// ===== Bulk upload students =====
router.post("/bulk", async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: "No students provided." });
    }

    // Hash default passwords for all students
    const studentsWithPassword = await Promise.all(
      students.map(async (s) => ({
        ...s,
        password: await bcrypt.hash(DEFAULT_PASSWORD, 10),
      }))
    );

    await Student.insertMany(studentsWithPassword, { ordered: false });

    // Send emails (optional)
    for (const s of studentsWithPassword) {
      if (s.email) await sendCredentialsEmail(s.email, s.name, s.regNumber);
    }

    res.json({ success: true, message: "Bulk students uploaded successfully." });
  } catch (error) {
    console.error("Bulk upload failed:", error);
    res.status(500).json({ success: false, message: "Bulk upload failed." });
  }
});

// ===== Get students by faculty/department/level =====
router.get("/", async (req, res) => {
  try {
    const { faculty, department, level } = req.query;

    const filter = {};
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;
    if (level) filter.level = level;

    const students = await Student.find(filter);
    res.json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ===== Delete student =====
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Student.findByIdAndDelete(id);
    res.json({ success: true, message: "Student deleted." });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;