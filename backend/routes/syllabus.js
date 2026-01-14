const express = require("express");
const router = express.Router();
const Syllabus = require("../models/Syllabus");
const Type = require("../models/Type");
const { body, validationResult } = require("express-validator");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

// Apply verifyToken to all routes (must be logged in)
router.use(verifyToken);

// ===== GET all Syllabus records =====
router.get("/", async (req, res) => {
  try {
    const { studentId, staffId, typeId, status } = req.query;

    let filter = {};
    if (studentId) filter.studentId = studentId;
    if (staffId) filter.staffId = staffId;
    if (typeId) filter.typeId = typeId;
    if (status) filter.status = status;

    const syllabus = await Syllabus.find(filter)
      .populate("typeId", "courseName courseCode semester level faculty department")
      .populate("staffId", "name email department")
      .populate("studentId", "name username faculty department")
      .populate("courseId", "courseName courseCode credits")
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      count: syllabus.length,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching Syllabus records",
      error: err.message,
    });
  }
});

// ===== GET Syllabus by ID =====
router.get("/:id", async (req, res) => {
  try {
    const syllabus = await Syllabus.findById(req.params.id)
      .populate("typeId")
      .populate("staffId", "name email department")
      .populate("studentId", "name username faculty department")
      .populate("courseId");

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus record not found",
      });
    }

    res.json({
      success: true,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching Syllabus record",
      error: err.message,
    });
  }
});

// ===== CREATE new Syllabus record =====
router.post(
  "/",
  isAdmin, // Only admin can create
  [
    body("typeId", "Type ID is required").notEmpty(),
    body("staffId", "Staff ID is required").notEmpty(),
    body("studentId", "Student ID is required").notEmpty(),
    body("courseId", "Course ID is required").notEmpty(),
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
      const { typeId, staffId, studentId, courseId, attendance } = req.body;

      // Check if combination already exists
      const existingSyllabus = await Syllabus.findOne({
        typeId,
        staffId,
        studentId,
        courseId,
      });

      if (existingSyllabus) {
        return res.status(400).json({
          success: false,
          message: "This student-course-staff combination already exists",
        });
      }

      const newSyllabus = new Syllabus({
        typeId,
        staffId,
        studentId,
        courseId,
        attendance: attendance || 0,
        status: "Active",
      });

      await newSyllabus.save();
      await newSyllabus.populate([
        { path: "typeId", select: "courseName courseCode semester level" },
        { path: "staffId", select: "name email department" },
        { path: "studentId", select: "name username faculty" },
        { path: "courseId", select: "courseName courseCode credits" },
      ]);

      res.status(201).json({
        success: true,
        message: "Syllabus record created successfully",
        data: newSyllabus,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error creating Syllabus record",
        error: err.message,
      });
    }
  }
);

// ===== UPDATE Syllabus record (marks, grades, attendance) =====
router.put(
  "/:id",
  isAdmin, // Only admin can update
  [
    body("marks").optional().isNumeric().custom((value) => {
      if (value < 0 || value > 100) throw new Error("Marks must be between 0 and 100");
      return true;
    }),
    body("grade").optional().isIn(["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "P"]),
    body("gpa").optional().isNumeric().custom((value) => {
      if (value < 0 || value > 4) throw new Error("GPA must be between 0 and 4");
      return true;
    }),
    body("attendance").optional().isNumeric().custom((value) => {
      if (value < 0 || value > 100) throw new Error("Attendance must be between 0 and 100");
      return true;
    }),
    body("status").optional().isIn(["Active", "Completed", "Dropped", "Pending"]),
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
      const syllabus = await Syllabus.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      )
        .populate("typeId", "courseName courseCode")
        .populate("staffId", "name email")
        .populate("studentId", "name username")
        .populate("courseId", "courseName courseCode");

      if (!syllabus) {
        return res.status(404).json({
          success: false,
          message: "Syllabus record not found",
        });
      }

      res.json({
        success: true,
        message: "Syllabus record updated successfully",
        data: syllabus,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error updating Syllabus record",
        error: err.message,
      });
    }
  }
);

// ===== DELETE Syllabus record =====
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const syllabus = await Syllabus.findByIdAndDelete(req.params.id);

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus record not found",
      });
    }

    res.json({
      success: true,
      message: "Syllabus record deleted successfully",
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting Syllabus record",
      error: err.message,
    });
  }
});

// ===== GET student's course assignments =====
router.get("/student/:studentId", async (req, res) => {
  try {
    const syllabusRecords = await Syllabus.find({
      studentId: req.params.studentId,
      status: "Active",
    })
      .populate("typeId", "courseName courseCode semester level faculty department")
      .populate("staffId", "name email")
      .populate("courseId", "courseName courseCode credits")
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      count: syllabusRecords.length,
      data: syllabusRecords,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching student course assignments",
      error: err.message,
    });
  }
});

// ===== GET staff's assigned courses =====
router.get("/staff/:staffId", async (req, res) => {
  try {
    const syllabusRecords = await Syllabus.find({
      staffId: req.params.staffId,
      status: "Active",
    })
      .populate("typeId", "courseName courseCode semester level")
      .populate("studentId", "name username regNumber")
      .populate("courseId", "courseName courseCode credits")
      .sort({ enrollmentDate: -1 });

    res.json({
      success: true,
      count: syllabusRecords.length,
      data: syllabusRecords,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff course assignments",
      error: err.message,
    });
  }
});

// ===== BULK ASSIGN students to course =====
router.post("/bulk-assign", isAdmin, async (req, res) => {
  try {
    const { typeId, staffId, studentIds, courseId } = req.body;

    if (!typeId || !staffId || !studentIds || !courseId || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: typeId, staffId, studentIds (array), courseId",
      });
    }

    const syllabusRecords = [];
    const errors = [];

    for (const studentId of studentIds) {
      try {
        // Check if combination already exists
        const existing = await Syllabus.findOne({
          typeId,
          staffId,
          studentId,
          courseId,
        });

        if (!existing) {
          const newRecord = new Syllabus({
            typeId,
            staffId,
            studentId,
            courseId,
            status: "Active",
          });
          await newRecord.save();
          syllabusRecords.push(newRecord);
        }
      } catch (err) {
        errors.push({
          studentId,
          error: err.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${syllabusRecords.length} students assigned successfully`,
      assignedCount: syllabusRecords.length,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      data: syllabusRecords,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error in bulk assignment",
      error: err.message,
    });
  }
});

module.exports = router;
