const mongoose = require("mongoose");

const SyllabusSchema = new mongoose.Schema(
  {
    typeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
      required: true,
      description: "Reference to Type collection (course per semester)",
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      description: "Staff member assigned to teach the course",
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      description: "Student assigned to take the course",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      description: "Reference to Course collection for additional details",
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Dropped", "Pending"],
      default: "Active",
    },
    marks: {
      type: Number,
      min: 0,
      max: 100,
      description: "Final marks/grade for the course",
    },
    grade: {
      type: String,
      enum: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "P", "F"],
      description: "Letter grade based on marks",
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      description: "GPA points for the course",
    },
    attendance: {
      type: Number,
      min: 0,
      max: 100,
      description: "Attendance percentage",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
SyllabusSchema.index({ typeId: 1, staffId: 1, studentId: 1 });
SyllabusSchema.index({ studentId: 1 });
SyllabusSchema.index({ staffId: 1 });

module.exports =
  mongoose.models.Syllabus || mongoose.model("Syllabus", SyllabusSchema);
