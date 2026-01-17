// Verification script for login fixes

const BASE_URL = "http://localhost:5000/api/auth";

const testLogin = async (username, password, role) => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ ${role} Login Successful:`, data.user.username, "Role:", data.user.role, "Faculty:", data.user.faculty);
            return true;
        } else {
            console.error(`❌ ${role} Login Failed:`, data.message);
            return false;
        }
    } catch (error) {
        console.error(`❌ ${role} Login Error:`, error.message);
        return false;
    }
};

const runTests = async () => {
    console.log("Starting Login Verification Tests...");

    // 1. Test Admin Login (assuming seeded)
    await testLogin("admin", "admin123", "Admin");

    // 2. Test Staff Login
    await testLogin("Staff/fas/01", "uov2026user", "Staff");

    // 3. Test Student Login
    await testLogin("2021/ICT/01", "uov2026user", "Student");
};

runTests();
