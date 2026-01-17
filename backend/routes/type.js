const express = require("express");
const router = express.Router();
const Type = require("../models/Type");
const { body, validationResult } = require("express-validator");

// ===== GET all Type courses =====
router.get("/", async (req, res) => {
  try {
    const { faculty, department, semester, level } = req.query;
    // Build filter object
    let filter = { isActive: true };
    if (faculty) filter.faculty = faculty;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (level) filter.level = level;

    const types = await Type.find(filter)
      .populate("prerequisites", "courseName courseCode")
      .sort({ semester: 1, level: 1 });

    res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching Type courses",
      error: err.message,
    });
  }
});

// ===== GET Type by ID =====
router.get("/:id", async (req, res) => {
  try {
    const type = await Type.findById(req.params.id).populate(
      "prerequisites",
      "courseName courseCode"
    );

    if (!type) {
      return res.status(404).json({
        success: false,
        message: "Type course not found",
      });
    }

    res.json({
      success: true,
      data: type,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching Type course",
      error: err.message,
    });
  }
});

// ===== CREATE new Type course =====
router.post(
  "/",
  [
    body("courseName", "Course name is required").trim().notEmpty(),
    body("courseCode", "Course code is required").trim().notEmpty(),
    body("courseUnit", "Course unit must be a number").isNumeric(),
    body("semester", "Semester is required").isIn(["First", "Second", "Third"]),
    body("level", "Level is required").trim().notEmpty(),
    body("faculty", "Faculty is required").isIn([
      "Business",
      "Technology",
      "Applied Science",
    ]),
    body("department", "Department is required").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    try {
      const {
        courseName,
        courseCode,
        courseUnit,
        semester,
        level,
        faculty,
        department,
        subDepartment,
        description,
        prerequisites,
      } = req.body;

      // Check if course code already exists
      const existingType = await Type.findOne({ courseCode });
      if (existingType) {
        return res.status(400).json({
          success: false,
          message: "Course code already exists",
        });
      }

      const newType = new Type({
        courseName,
        courseCode,
        courseUnit,
        semester,
        level,
        faculty,
        department,
        subDepartment,
        description,
        prerequisites: prerequisites || [],
      });

      await newType.save();

      res.status(201).json({
        success: true,
        message: "Type course created successfully",
        data: newType,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error creating Type course",
        error: err.message,
      });
    }
  }
);

// ===== UPDATE Type course =====
router.put(
  "/:id",
  [
    body("courseName").optional().trim(),
    body("courseUnit").optional().isNumeric(),
    body("semester").optional().isIn(["First", "Second", "Third"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    try {
      const type = await Type.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!type) {
        return res.status(404).json({
          success: false,
          message: "Type course not found",
        });
      }

      res.json({
        success: true,
        message: "Type course updated successfully",
        data: type,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error updating Type course",
        error: err.message,
      });
    }
  }
);

// ===== DELETE Type course =====
router.delete("/:id", async (req, res) => {
  try {
    const type = await Type.findByIdAndDelete(req.params.id);

    if (!type) {
      return res.status(404).json({
        success: false,
        message: "Type course not found",
      });
    }

    res.json({
      success: true,
      message: "Type course deleted successfully",
      data: type,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting Type course",
      error: err.message,
    });
  }
});

// ===== GET courses by Faculty =====
router.get("/faculty/:facultyName", async (req, res) => {
  try {
    const types = await Type.find({
      faculty: req.params.facultyName,
      isActive: true,
    });

    res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses for faculty",
      error: err.message,
    });
  }
});

// ===== GET courses by Department =====
router.get("/department/:departmentName", async (req, res) => {
  try {
    const types = await Type.find({
      department: req.params.departmentName,
      isActive: true,
    });

    res.json({
      success: true,
      count: types.length,
      data: types,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching courses for department",
      error: err.message,
    });
  }
});

module.exports = router;
