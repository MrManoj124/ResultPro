// Using native fetch (Node 18+)

// We need valid ObjectIds.
const generateObjectId = () => {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => (Math.random() * 16 | 0).toString(16)).toLowerCase();
};

async function verifySyllabus() {
    const BASE_URL = "http://localhost:5000/api";
    let adminToken = "";
    let studentToken = ""; // If we can get one

    console.log("🚀 Starting Syllabus Verification Test...");

    // 1. Login as Admin
    console.log("\n🔹 Step 1: Login as Admin");
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "admin123" })
        });

        if (res.ok) {
            const data = await res.json();
            adminToken = data.token;
            console.log("✅ Admin Login successful.");
        } else {
            console.error("❌ Admin Login Failed:", res.status);
            const txt = await res.text();
            console.log(txt);
            return;
        }
    } catch (err) {
        console.error("Login Error:", err);
        return;
    }

    // 2. Create Syllabus Entry (Admin)
    console.log("\n🔹 Step 2: Create Syllabus Entry (as Admin)");
    let syllabusId = "";
    const dummyData = {
        typeId: generateObjectId(),
        staffId: generateObjectId(),
        studentId: generateObjectId(),
        courseId: generateObjectId(),
        attendance: 85
    };

    try {
        const res = await fetch(`${BASE_URL}/syllabus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            },
            body: JSON.stringify(dummyData)
        });

        if (res.ok) {
            const data = await res.json();
            syllabusId = data.data._id;
            console.log("✅ Syllabus Created. ID:", syllabusId);
        } else {
            console.error("❌ Create Syllabus Failed:", res.status);
            console.log(await res.text());
            // If validation fails due to missing real refs, we might need to seed real data first.
            // But verify_auth.js succeeded, so db handles dummy IDs usually unless app logic explicitly checks 'findOne' in that other table.
            // routes/syllabus.js line 120 calls populate(), which doesn't throw on missing ref.
        }
    } catch (err) {
        console.error("Create Error:", err);
    }

    if (!syllabusId) {
        console.log("⚠️ Skipping Read tests because Creation failed.");
    } else {
        // 3. Read Syllabus Entry (Admin)
        console.log("\n🔹 Step 3: Read Syllabus Entry (as Admin)");
        try {
            const res = await fetch(`${BASE_URL}/syllabus/${syllabusId}`, {
                headers: { "Authorization": `Bearer ${adminToken}` }
            });
            if (res.ok) {
                console.log("✅ Read Syllabus successful.");
            } else {
                console.error("❌ Read Syllabus Failed:", res.status);
            }
        } catch (err) {
            console.error("Read Error:", err);
        }
    }

    // 4. Access as Non-Admin (No Token)
    console.log("\n🔹 Step 4: Access as Non-Admin (No Token)");
    try {
        const res = await fetch(`${BASE_URL}/syllabus`, {
            // No Authorization header
        });
        if (res.status === 401 || res.status === 403) {
            console.log(`✅ Access Denied correctly (Status: ${res.status}).`);
        } else {
            console.error(`❌ Access NOT Denied! Status: ${res.status}`);
        }
    } catch (err) {
        console.error("Non-Admin Access Error:", err);
    }

    // 5. Try to Create as Non-Admin (No Token)
    console.log("\n🔹 Step 5: Try to Create as Non-Admin (No Token)");
    try {
        const res = await fetch(`${BASE_URL}/syllabus`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dummyData)
        });
        if (res.status === 401 || res.status === 403) {
            console.log(`✅ Create Denied correctly (Status: ${res.status}).`);
        } else {
            console.error(`❌ Create NOT Denied! Status: ${res.status}`);
        }
    } catch (err) {
        console.error("Non-Admin Create Error:", err);
    }

    console.log("\nVerification Complete.");
}

verifySyllabus();
