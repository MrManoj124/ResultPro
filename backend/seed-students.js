const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/studentSchema");
require("dotenv").config();

const studentData = [
    {
        name: "John Doe",
        regNumber: "REG2023001",
        indexNumber: "IDX001",
        academicYear: "2023/2024",
        username: "john",
        password: "password123",
        faculty: "Applied Science",
        department: "Physical Science Department",
        email: "john@student.univ.edu"
    },
    {
        name: "Jane Smith",
        regNumber: "REG2023002",
        indexNumber: "IDX002",
        academicYear: "2023/2024",
        username: "jane",
        password: "password123",
        faculty: "Business",
        department: "Business Management Department",
        email: "jane@student.univ.edu"
    }
];
mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");

        for (const s of studentData) {
            const existing = await Student.findOne({ username: s.username });
            if (!existing) {
                const hashedPassword = await bcrypt.hash(s.password, 10);
                await Student.create({ ...s, password: hashedPassword });
                console.log(`Created student: ${s.name}`);
            } else {
                console.log(`Student ${s.name} already exists`);
            }
        }
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

