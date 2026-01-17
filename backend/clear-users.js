const mongoose = require("mongoose");
const Student = require("./models/studentSchema");
const Staff = require("./models/staffSchema");
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB");
        await Student.deleteMany({});
        console.log("Cleared Student collection");
        await Staff.deleteMany({});
        console.log("Cleared Staff collection");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
