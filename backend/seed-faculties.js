const mongoose = require("mongoose");
const Faculty = require("./models/Faculty");
require("dotenv").config();

// Seed data for faculties and departments
const seedData = [
  {
    facultyName: "Business",
    departments: [
      {
        departmentName: "Banking Insurance Department",
        subDepartments: [],
        description: "Banking and Insurance studies",
      },
      {
        departmentName: "Business Management Department",
        subDepartments: [],
        description: "Business Management and Administration",
        courseCount: 5,
      },
      {
        departmentName: "Project Management Department",
        subDepartments: [],
        description: "Project Management and Planning",
      },
    ],
  },
  {
    facultyName: "Technology",
    departments: [
      {
        departmentName: "Technology Department",
        subDepartments: [],
        description: "Technology and Engineering",
      },
    ],
  },
  {
    facultyName: "Applied Science",
    departments: [
      {
        departmentName: "Bio-Science Department",
        subDepartments: [
          {
            subDepartmentName: "Biology",
            description: "Biological Sciences",
          },
        ],
        description: "Biological Sciences",
      },
      {
        departmentName: "Physical Science Department",
        subDepartments: [
          {
            subDepartmentName: "Information and Communication Technology",
            description: "ICT and Computer Science",
          },
          {
            subDepartmentName: "Applied Mathematical and Computer Science",
            description: "Mathematics and Computer Science",
          },
        ],
        description: "Physical Sciences",
      },
    ],
  },
];

// Connect to MongoDB and seed data
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    try {
      // Delete existing faculties
      await Faculty.deleteMany({});
      console.log("🗑️  Cleared existing faculties");

      // Insert new faculties
      const inserted = await Faculty.insertMany(seedData);
      console.log("✅ Faculties seeded successfully!");
      console.log(`   - Business Faculty with 3 departments`);
      console.log(`   - Technology Faculty with 1 department`);
      console.log(`   - Applied Science Faculty with 2 departments`);

      console.log("\n📋 Faculties created:");
      inserted.forEach((faculty) => {
        console.log(`\n📚 ${faculty.facultyName} Faculty:`);
        faculty.departments.forEach((dept) => {
          console.log(`   ├─ ${dept.departmentName}`);
          if (dept.subDepartments.length > 0) {
            dept.subDepartments.forEach((subDept) => {
              console.log(`   │  └─ ${subDept.subDepartmentName}`);
            });
          }
        });
      });

      process.exit(0);
    } catch (error) {
      console.error("❌ Error seeding data:", error.message);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
