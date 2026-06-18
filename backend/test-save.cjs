async function testSaveAll() {
    try {
        const signupRes = await fetch("http://localhost:8080/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User 2", email: "test" + Date.now() + "@example.com", password: "password123" })
        });
        const token = (await signupRes.json()).token;

        await fetch("http://localhost:8080/api/pathfinder/saved-roadmaps", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ careerTitle: "Test Compare", roadmapData: "{\"data\":\"test\"}", type: "compare" })
        });
        
        await fetch("http://localhost:8080/api/pathfinder/saved-roadmaps", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ careerTitle: "Test Resume", roadmapData: "{\"data\":\"test\"}", type: "resume" })
        });

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
testSaveAll();
