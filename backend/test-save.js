const fetch = require('node-fetch');

async function testSave() {
    try {
        // 1. Signup a test user
        const signupRes = await fetch("http://localhost:8080/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email: "test" + Date.now() + "@example.com", password: "password123" })
        });
        const signupData = await signupRes.json();
        const token = signupData.token;
        console.log("Token:", token);

        // 2. Save a roadmap
        const saveRes = await fetch("http://localhost:8080/api/pathfinder/saved-roadmaps", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                careerTitle: "Software Engineer",
                roadmapData: JSON.stringify({ some: "data" }),
                type: "roadmap"
            })
        });
        console.log("Save status:", saveRes.status);
        console.log("Save body:", await saveRes.text());

        // 3. Fetch saved roadmaps
        const getRes = await fetch("http://localhost:8080/api/pathfinder/saved-roadmaps", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log("Get status:", getRes.status);
        console.log("Get body:", await getRes.text());
        
    } catch (e) {
        console.error(e);
    }
}
testSave();
