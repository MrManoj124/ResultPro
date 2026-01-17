const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/studentSchema");
require("dotenv").config();

const studentData = [
    {
        name: "John Doe",
        regNumber: "2021/ICT/01",
        indexNumber: "IDX001",
        academicYear: "2021/2022",
        username: "2021/ICT/01",
        password: "uov2026user",
        faculty: "Applied Science",
        department: "Information and Communication Technology",
        email: "john@student.univ.edu"
    },
    {
        name: "Jane Smith",
        regNumber: "2023/BMS/01",
        indexNumber: "IDX002",
        academicYear: "2023/2024",
        username: "2023/BMS/01",
        password: "uov2026user",
        faculty: "Business Studies",
        department: "Business Management Department",
        email: "jane@student.univ.edu"
    },
    {
        name: "Test Student",
        regNumber: "2021/ICT/74",
        indexNumber: "IDX003",
        academicYear: "2021/2022",
        username: "2021/ICT/74",
        password: "uov2026user",
        faculty: "Applied Science",
        department: "Information and Communication Technology",
        email: "teststudent@univ.edu"
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
