const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
  {
    facultyName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      enum: ["Business", "Technology", "Applied Science"],
    },
    departments: [
      {
        departmentId: mongoose.Schema.Types.ObjectId,
        departmentName: {
          type: String,
          required: true,
          trim: true,
        },
        subDepartments: [
          {
            subDepartmentName: String,
            description: String,
          },
        ],
        courseCount: {
          type: Number,
          default: 0,
        },
        description: String,
      },
    ],
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

module.exports = mongoose.model("Faculty", FacultySchema);