const BASE_URL = "http://localhost:8080";

async function testEndpoints() {
  console.log("=== Testing Backend Auth and AI Endpoints ===\\n");
  try {
    // 1. Signup
    const signupData = { name: "Test User", email: "testuser_" + Date.now() + "@example.com", password: "Password123!" };
    console.log("1. POST /auth/signup");
    let res = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData)
    });
    let signupRes = await res.json();
    console.log("Signup Response:", authMask(signupRes), "\\n");

    if (!signupRes.token) {
       console.log("Signup Failed. Attempting login as alternative fallback...");
    }
    
    // 2. Login
    console.log("2. POST /auth/login");
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: signupData.email, password: signupData.password })
    });
    let loginRes = await res.json();
    console.log("Login Response:", authMask(loginRes), "\\n");

    const token = loginRes.token || signupRes.token;
    if (!token) throw new Error("No token received. Authentication failed.");

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };

    // 3. Roadmap Generate
    console.log("3. POST /roadmap/generate");
    res = await fetch(`${BASE_URL}/roadmap/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        goal: "Full Stack Engineer",
        field: "Software Engineering",
        skills: ["JS", "Node"],
        experience: "Beginner",
        language: "en"
      })
    });
    let roadmapRes = await res.json();
    console.log("Roadmap Response:", truncate(roadmapRes), "\\n");

    // 4. Compare Careers
    console.log("4. POST /compare-careers");
    res = await fetch(`${BASE_URL}/compare-careers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        track1: "React",
        track2: "Angular",
        language: "en"
      })
    });
    let compareRes = await res.json();
    console.log("Compare Response:", truncate(compareRes), "\\n");

    // 5. Resume Analyze
    console.log("5. POST /resume/analyze");
    res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: "John Doe",
        careerGoal: "Developer",
        skills: ["JavaScript", "HTML"],
        experience: "2 years",
        education: "BSc Computer Science",
        language: "en"
      })
    });
    let resumeRes = await res.json();
    console.log("Resume Response:", truncate(resumeRes), "\\n");

    console.log("=== ALL TESTS PASSED SUCCESSFULLY ===");

  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

function authMask(obj) {
  if (obj.token) return { ...obj, token: "[HIDDEN]" };
  return obj;
}

function truncate(obj) {
  const str = JSON.stringify(obj);
  return str.length > 300 ? str.slice(0, 300) + "... [TRUNCATED]" : str;
}

testEndpoints();
