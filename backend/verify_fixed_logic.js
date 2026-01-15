const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Staff = require("./models/staffSchema");
const Student = require("./models/studentSchema");
require("dotenv").config();

async function testLogin(username, password) {
    console.log(`Testing login for: ${username}`);

    // 1. Admin/Student Check (Simulated)
    let user = await Student.findOne({ username });
    let role = user ? (user.role || 'student') : null;

    // 2. Staff Check (The Fix)
    if (!user) {
        console.log("Not found in Student, checking Staff...");
        user = await Staff.findOne({ username });
        if (user) {
            role = user.role || "staff";
            console.log("Found in Staff!");
        }
    }

    if (!user) {
        console.log("User not found in any collection.");
        return false;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        console.log("Invalid password.");
        return false;
    }

    console.log(`Login Successful! Role: ${role}`);
    return true;
}

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        const success = await testLogin("alice", "password123");
        if (success) {
            console.log("VERIFICATION PASSED: The new logic correctly logs in 'alice'.");
        } else {
            console.log("VERIFICATION FAILED: logic still fails.");
        }
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

