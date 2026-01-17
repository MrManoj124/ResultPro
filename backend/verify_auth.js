// Using native fetch
// Actually, node environment might not have fetch by default depending on version.
// Using reliable 'http' or creating a simple test script.
// Assuming Node 18+ has native fetch.

async function testAuth() {
    const BASE_URL = "http://localhost:5000/api";


    console.log("Starting verification...");

    // 1. Try to access syllabus without token
    try {
        const res = await fetch(`${BASE_URL}/syllabus`);
        if (res.status === 401 || res.status === 403) {
            console.log("✅ Protected Route check passed (No token -> 401/403)");
        } else {
            console.error(`❌ Protected Route check FAILED (Status: ${res.status})`);
            // console.log(await res.text());
        }
    } catch (err) {
        console.error("Error accessing syllabus:", err.message);
    }

    // 2. Login as Admin
    let token = "";
    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "admin123" })
        });

        // Login logic in auth.js: checks `if (!faculty || !faculties[faculty])`.
        // Wait, the auth.js login implementation I remember (step 49) had multitenancy checks.
        // IT REQUIRED A VALID FACULTY.
        // "faculty" must be one of "Applied", "BusinessStudies", "TechnologicalStudies" (keys in `faculties` object). 
        // And it looked for STUDENT model in that faculty db. 

        // WAIT. EXISTING AUTH LOGIN IS FOR STUDENTS ONLY?
        // Step 49:
        // `const Student = faculties[faculty].model("Student", studentSchema);`
        // `const user = await Student.findOne({ username });`

        // The existing `/login` route ONLY checks Student collections!
        // It does NOT check the Admin collection!

        // THIS IS A CRITICAL FINDING.
        // My Implementation Plan assumed updating `login` to return a token would suffice.
        // But `login` logic specifically queries STUDENT databases.
        // Admins are in the main DB (likely), or `Admin` model.

        // I need to UPDATE `auth.js` to handle Admin login as well!
        // Or add a separate `/admin/login`.

        // Since I modified `auth.js` to issue tokens, I didn't change the USER LOOKUP logic.
        // So currently, an Admin cannot login via `/api/auth/login`.

        // Admin login should now work
        if (res.ok) {
            const data = await res.json();
            token = data.token;
            console.log("✅ Admin Login successful. Token received.");

            // 3. Access Protected Route WITH Token
            try {
                const protectedRes = await fetch(`${BASE_URL}/syllabus`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (protectedRes.ok) {
                    console.log("✅ Protected Route check passed (With Token -> 200 OK)");
                } else {
                    console.error(`❌ Protected Route check FAILED with Token (Status: ${protectedRes.status})`);
                    console.log(await protectedRes.text());
                }
            } catch (pErr) {
                console.error("Error accessing protected route with token:", pErr);
            }

        } else {
            console.error(`❌ Admin Login FAILED (Status: ${res.status})`);
            console.log(await res.text());
        }
    } catch (err) {
        console.error("Login test error:", err);
    }
}

testAuth();

