require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/admin");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db";

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        try {
            const existing = await Admin.findOne({ username: "admin" });
            if (existing) {
                console.log("Admin user 'admin' already exists.");
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash("admin123", salt);

                const newAdmin = new Admin({
                    username: "admin",
                    password: hashedPassword,
                    role: "admin",
                    name: "System Admin"
                });

                await newAdmin.save();
                console.log("✅ Admin user 'admin' created with password 'admin123'.");
            }
            process.exit(0);
        } catch (error) {
            console.error("❌ Error seeding admin:", error);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });
