const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffSchema");
require("dotenv").config();

const staffData = [
    {
        name: "Dr. Alice Smith",
        staffId: "STF001",
        department: "Information and Communication Technology",
        faculty: "Applied Science",
        email: "alice@univ.edu",
        username: "Staff/fas/01",
        password: "uov2026user",
        role: "staff"
    },
    {
        name: "Prof. Bob Jones",
        staffId: "STF002",
        department: "Business Management Department",
        faculty: "Business Studies",
        email: "bob@univ.edu",
        username: "Staff/fas/02",
        password: "uov2026user",
        role: "staff"
    },
    {
        name: "Test Staff",
        staffId: "Staff/FAS/12",
        department: "Faculty of Applied Science",
        faculty: "Applied Science",
        email: "teststaff@univ.edu",
        username: "Staff/fas/12",
        password: "uov2026user",
        role: "staff"
    }
];

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");

        for (const s of staffData) {
            const existing = await Staff.findOne({ username: s.username });
            if (!existing) {
                const hashedPassword = await bcrypt.hash(s.password, 10);
                await Staff.create({ ...s, password: hashedPassword });
                console.log(`Created staff: ${s.name}`);
            } else {
                console.log(`Staff ${s.name} already exists`);
            }
        }
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
