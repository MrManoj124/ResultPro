const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Student = require("./models/studentSchema"); // Adjust path if needed
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB for verification");

        const username = "2021/ICT/74";
        const passwordAttempt = "uov2026user";

        const user = await Student.findOne({ username: username });

        if (!user) {
            console.log(`User ${username} NOT FOUND in database.`);
        } else {
            console.log(`User ${username} FOUND.`);
            console.log(`Stored Hash: ${user.password}`);

            const isMatch = await bcrypt.compare(passwordAttempt, user.password);
            console.log(`Password match result for '${passwordAttempt}': ${isMatch}`);

            if (!isMatch) {
                // Check if it matches 'password123' just in case
                const isDefaultMatch = await bcrypt.compare("password123", user.password);
                console.log(`Does it match 'password123'? ${isDefaultMatch}`);
            }
        }

        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

