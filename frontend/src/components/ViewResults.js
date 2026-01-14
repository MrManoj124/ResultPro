import React, { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/ViewResults.css";

function ViewResults({ onBack, user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const fetchResults = async () => {
    if (!user || !user._id) return;

    setLoading(true);
    setError("");
    try {
      // Fetch syllabus records using AXIOS to support auth headers
      const res = await axios.get(`http://localhost:5000/api/syllabus?staffId=${user._id}`);

      if (res.data && res.data.success) {
        setResults(res.data.data);
      } else {
        setResults([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  return (
    <div className="view-results-container">
      <h2>📊 Uploaded Student Results</h2>

      <div className="top-actions">
        <button className="refresh-btn" onClick={fetchResults}>🔄 Refresh</button>
        {onBack && (
          <button className="back-btn" onClick={onBack}>⬅ Back</button>
        )}
      </div>

      {loading && <p className="loading">Loading results...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && results.length > 0 ? (
        <table className="results-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Grade</th>
              <th>Staff</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.studentId?.username || r.studentId?.name || "N/A"}</td>
                <td>{r.courseId?.courseName || r.typeId?.courseName || "N/A"}</td>
                <td>{r.grade || "-"}</td>
                <td>{r.staffId?.name || user.username}</td>
                <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && !error && <p className="no-results">No results found.</p>
      )}
    </div>
  );
}

export default ViewResults;