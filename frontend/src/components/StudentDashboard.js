import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/StudentDashboard.css";

function StudentDashboard({ user, handleLogout }) {
  const [level, setLevel] = useState("Level 1");
  const [semester, setSemester] = useState("First Semester");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user._id) {
      fetchResults();
    }
  }, [user]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Fetch syllabus records for this student
      const response = await axios.get(`http://localhost:5000/api/syllabus/student/${user._id}`);
      if (response.data.success) {
        // Transform data to match UI expected format
        const mappedResults = response.data.data.map(item => ({
          code: item.courseId?.courseCode || item.typeId?.courseCode || "N/A",
          name: item.courseId?.courseName || item.typeId?.courseName || "Unknown Course",
          grade: item.grade || "-",
          gpa: item.gpa || 0,
          credits: item.courseId?.credits || item.typeId?.courseUnit || 0,
          // We can use these for filtering if needed, though the UI currently filters locally? 
          // Actually the current UI just shows "Level X - Semester Y Results". 
          // But the received data might be mixed.
          // Let's store all and filter in render, or filter in API.
          level: item.typeId?.level,
          semester: item.typeId?.semester
        }));
        setResults(mappedResults);
      }
    } catch (err) {
      console.error("Failed to fetch results", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on selected Level and Semester
  // Note: Backend might use "First", "Second" vs "First Semester"
  // Let's normalize.
  const filteredResults = results.filter(r => {
    // Normalize level string
    const rLevel = r.level || "";
    const rSemester = r.semester || "";

    // Simple loose matching for now
    // eslint-disable-next-line no-unused-vars
    const levelMatch = rLevel.includes(level) || (level === "Level 1" && rLevel.includes("1"));
    // This is a bit hacky, but safe for now given "Level 1" vs "Level 1" exact match potential issues if data differs.
    // Actually the mock data had "Level 1", backend has "Level 1". match should be fine.

    // Normalize semester
    const selectedSem = semester.split(" ")[0]; // "First" from "First Semester"
    // eslint-disable-next-line no-unused-vars
    const semMatch = rSemester.includes(selectedSem);

    // Use the robust matching
    return levelMatch && semMatch;
  });

  const totalCredits = filteredResults.reduce((sum, r) => sum + (r.credits || 0), 0);
  // eslint-disable-next-line no-unused-vars
  // const totalGpaPoints = filteredResults.reduce((sum, r) => sum + (r.gpa * r.credits), 0); 
  // Original mock just averaged GPA. Let's stick to simple average if credits are missing, or weighted if present.
  // Original: (sum GPA / count). Let's keep it simple.
  const avgGpa = filteredResults.length ? (filteredResults.reduce((sum, r) => sum + (r.gpa || 0), 0) / filteredResults.length).toFixed(2) : "0.00";

  return (
    <div className="student-dashboard-container">
      <header className="student-header">
        <h1>🎓 University Result Management System</h1>
        <div className="header-right">
          <span>{user.username} ({user.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="student-info">
        <h2>Welcome, {user.username}</h2>
        <p>Student ID: {user._id}</p>
        <div className="gpa-box">Current GPA (Selected Term): <strong>{avgGpa}</strong></div>
      </div>

      <div className="selectors">
        <div className="level-select">
          <span>Select Level:</span>
          {["Level 1", "Level 2", "Level 3", "Level 4"].map(l => (
            <button
              key={l}
              className={level === l ? "active" : ""}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="semester-select">
          <span>Select Semester:</span>
          {["First Semester", "Second Semester"].map(s => (
            <button
              key={s}
              className={semester === s ? "active" : ""}
              onClick={() => setSemester(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="results-section">
        <h3>{level} - {semester} Results</h3>
        {loading ? (
          <p>Loading results...</p>
        ) : (
          <>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Grade</th>
                  <th>GPA</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((r, i) => (
                    <tr key={i}>
                      <td>{r.code}</td>
                      <td>{r.name}</td>
                      <td>{r.grade}</td>
                      <td>{r.gpa}</td>
                      <td>{r.credits}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">No results found for this term.</td></tr>
                )}
              </tbody>
            </table>

            <div className="summary">
              <div>Total Courses: {filteredResults.length}</div>
              <div>GPA: {avgGpa}</div>
              <div>Total Credits: {totalCredits}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;