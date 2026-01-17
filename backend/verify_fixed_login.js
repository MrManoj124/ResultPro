const axios = require("axios");

const BASE_URL = "http://localhost:5000/api/auth";

const testLogin = async (username, password, role) => {
    try {
        const response = await axios.post(`${BASE_URL}/login`, { username, password });
        console.log(`✅ ${role} Login Successful:`, response.data.user.username, "Role:", response.data.user.role, "Faculty:", response.data.user.faculty);
        return true;
    } catch (error) {
        console.error(`❌ ${role} Login Failed:`, error.response ? error.response.data.message : error.message);
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
