const http = require('http');

const data = JSON.stringify({
    username: "alice",
    password: "password123"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log("Attempting to log in as 'alice'...");

const req = http.request(options, (res) => {
    let chunks = [];
    res.on('data', (d) => chunks.push(d));
    res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Body: ${body}`);
        try {
            const json = JSON.parse(body);
            if (res.statusCode === 200 && json.token && json.user) {
                console.log("Token generated:", !!json.token);
                console.log("User Role:", json.user.role);
                if (json.user.role === 'staff') {
                    console.log("SUCCESS: User logged in as staff.");
                } else {
                    console.log("WARNING: User logged in, but role is " + json.user.role);
                }
            } else {
                console.log("FAILURE: Login failed.");
            }
        } catch (e) {
            console.log("Error parsing JSON response.");
        }
    });
});

req.on('error', (error) => {
    console.error(`Error requesting server: ${error.message}`);
    console.log("NOTE: Ensure the server is running on port 5000. If not, the verification will fail due to connection error.");
});

req.write(data);
req.end();
