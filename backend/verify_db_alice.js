const mongoose = require("mongoose");
const Staff = require("./models/staffSchema");
require("dotenv").config();

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/university_db", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("Connected to MongoDB for verification");
        const alice = await Staff.findOne({ username: "alice" });
        if (alice) {
            console.log("FOUND: Alice exists in DB.");
            console.log(alice);
        } else {
            console.log("NOT FOUND: Alice does NOT exist in DB.");
        }
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
