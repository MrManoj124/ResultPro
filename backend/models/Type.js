const mongoose = require("mongoose");

const TypeSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    courseUnit: {
      type: Number,
      required: true,
      description: "Credit hours or course units",
    },
    semester: {
      type: String,
      required: true,
      enum: ["First", "Second", "Third"],
    },
    level: {
      type: String,
      required: true,
      description: "Level/Year (e.g., Level 1, Level 2, etc)",
    },
    faculty: {
      type: String,
      required: true,
      enum: ["Business", "Technology", "Applied Science"],
    },
    department: {
      type: String,
      required: true,
      description: "Department name within faculty",
    },
    subDepartment: {
      type: String,
      trim: true,
      description: "Optional sub-department (e.g., ICT within Physical Science)",
    },
    description: {
      type: String,
      trim: true,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.models.Type || mongoose.model("Type", TypeSchema);
