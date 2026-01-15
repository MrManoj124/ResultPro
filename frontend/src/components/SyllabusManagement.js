import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/SyllabusManagement.css";

const SyllabusManagement = () => {
  const [syllabuses, setSyllabuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("view"); // view, bulk-assign, mark-entry

  // Form states
  const [bulkAssignForm, setBulkAssignForm] = useState({
    typeId: "",
    staffId: "",
    courseId: "",
    studentIds: [],
  });


  const [markEntryForm, setMarkEntryForm] = useState({
    syllabusId: "",
    marks: "",
    grade: "",
    gpa: "",
    attendance: "",
  });

  const [editingSyllabusId, setEditingSyllabusId] = useState(null);
  const [filters, setFilters] = useState({
    faculty: "",
    department: "",
    semester: "",
    level: "",
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ===== Fetch all data on mount =====
  useEffect(() => {
    fetchSyllabuses();
    fetchDropdownData();
  }, []);

  // ===== Fetch Syllabuses =====
  const fetchSyllabuses = async (filterParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams(filterParams).toString();
      const url = `${API_URL}/api/syllabus${queryParams ? `?${queryParams}` : ""}`;
      // axios defaults are set in App.js with the token, so no manual header needed here if token is present
      const response = await axios.get(url);
      setSyllabuses(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch syllabuses: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Fetch dropdown data (Types, Students, Staff, Courses) =====
  const fetchDropdownData = async () => {
    try {
      const [typesRes, studentsRes, staffRes, coursesRes] = await Promise.all([
        axios.get(`${API_URL}/api/type`),
        axios.get(`${API_URL}/api/students`),
        axios.get(`${API_URL}/api/staff`),
        axios.get(`${API_URL}/api/courses`),
      ]);

      setTypes(typesRes.data.data || []);
      setStudents(studentsRes.data.students || []);
      setStaff(staffRes.data.data || []);
      // Courses API returns array directly
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  // ===== Handle filter change =====
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===== Apply filters =====
  const applyFilters = () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    fetchSyllabuses(activeFilters);
  };

  // ===== Reset filters =====
  const resetFilters = () => {
    setFilters({ faculty: "", department: "", semester: "", level: "" });
    fetchSyllabuses();
  };

  // ===== Handle bulk assign form input =====
  const handleBulkAssignChange = (e) => {
    const { name, value, options } = e.target;
    if (name === "studentIds") {
      const selectedOptions = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      setBulkAssignForm((prev) => ({
        ...prev,
        studentIds: selectedOptions,
      }));
    } else {
      setBulkAssignForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ===== Submit bulk assign =====
  const handleBulkAssign = async (e) => {
    e.preventDefault();
    const selectedType = types.find(t => t._id === bulkAssignForm.typeId);
    if (!selectedType) {
      setError("Invalid Type selected");
      return;
    }

    // Find corresponding Course ID using courseCode
    const matchingCourse = courses.find(c => c.courseCode === selectedType.courseCode);
    if (!matchingCourse) {
      setError(`No Course found matching code '${selectedType.courseCode}'. Please create a Course with this code first.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/syllabus/bulk-assign`,
        { ...bulkAssignForm, courseId: matchingCourse._id }
      );
      if (response.data.success) {
        alert(
          `Successfully assigned ${response.data.assignedCount} students to course!`
        );
        setBulkAssignForm({
          typeId: "",
          staffId: "",
          courseId: "",
          studentIds: [],
        });
        setActiveTab("view");
        fetchSyllabuses();
      }
    } catch (err) {
      setError(
        "Failed to bulk assign: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== Handle mark entry form input =====
  const handleMarkEntryChange = (e) => {
    const { name, value } = e.target;
    setMarkEntryForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===== Open mark entry form =====
  const openMarkEntry = (syllabusId) => {
    const syllabus = syllabuses.find((s) => s._id === syllabusId);
    if (syllabus) {
      setMarkEntryForm({
        syllabusId: syllabusId,
        marks: syllabus.marks || "",
        grade: syllabus.grade || "",
        gpa: syllabus.gpa || "",
        attendance: syllabus.attendance || "",
      });
      setEditingSyllabusId(syllabusId);
      setActiveTab("mark-entry");
    }
  };

  // ===== Submit mark entry =====
  const handleMarkEntry = async (e) => {
    e.preventDefault();
    if (
      markEntryForm.marks === "" ||
      markEntryForm.grade === "" ||
      markEntryForm.gpa === ""
    ) {
      setError("Please fill marks, grade, and GPA");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.put(
        `${API_URL}/api/syllabus/${markEntryForm.syllabusId}`,
        {
          marks: parseInt(markEntryForm.marks),
          grade: markEntryForm.grade,
          gpa: parseFloat(markEntryForm.gpa),
          attendance: parseInt(markEntryForm.attendance) || 0,
        }
      );

      if (response.data.success) {
        alert("Marks updated successfully!");
        setMarkEntryForm({
          syllabusId: "",
          marks: "",
          grade: "",
          gpa: "",
          attendance: "",
        });
        setEditingSyllabusId(null);
        setActiveTab("view");
        fetchSyllabuses();
      }
    } catch (err) {
      setError(
        "Failed to update marks: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Syllabus =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.delete(`${API_URL}/api/syllabus/${id}`);
      if (response.data.success) {
        alert("Assignment deleted successfully!");
        fetchSyllabuses();
      }
    } catch (err) {
      setError("Failed to delete: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="syllabus-management">
      <div className="syllabus-header">
        <h2>📋 Syllabus Management</h2>
        <div className="tabs">
          <button
            className={`tab ${activeTab === "view" ? "active" : ""}`}
            onClick={() => setActiveTab("view")}
          >
            View Syllabuses
          </button>
          <button
            className={`tab ${activeTab === "bulk-assign" ? "active" : ""}`}
            onClick={() => setActiveTab("bulk-assign")}
          >
            Bulk Assign Students
          </button>
          <button
            className={`tab ${activeTab === "mark-entry" ? "active" : ""}`}
            onClick={() => setActiveTab("mark-entry")}
          >
            Enter Marks
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* View Syllabuses Tab */}
      {
        activeTab === "view" && (
          <div className="view-tab">
            <div className="filters">
              <h3>Filters</h3>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Faculty</label>
                  <select
                    name="faculty"
                    value={filters.faculty}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Faculties</option>
                    <option value="Business">Business</option>
                    <option value="Technology">Technology</option>
                    <option value="Applied Science">Applied Science</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    placeholder="Department name"
                  />
                </div>
                <div className="filter-group">
                  <label>Semester</label>
                  <select
                    name="semester"
                    value={filters.semester}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Semesters</option>
                    <option value="First">First</option>
                    <option value="Second">Second</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Level</label>
                  <select
                    name="level"
                    value={filters.level}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Levels</option>
                    <option value="Level 1">Level 1</option>
                    <option value="Level 2">Level 2</option>
                    <option value="Level 3">Level 3</option>
                    <option value="Level 4">Level 4</option>
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button className="btn-primary" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button className="btn-secondary" onClick={resetFilters}>
                  Reset
                </button>
              </div>
            </div>

            {/* Syllabuses Table */}
            <div className="syllabuses-list">
              {loading ? (
                <div className="loading">Loading...</div>
              ) : syllabuses.length === 0 ? (
                <p className="no-data">No syllabuses found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="syllabuses-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Staff</th>
                        <th>Status</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>GPA</th>
                        <th>Attendance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabuses.map((syllabus) => (
                        <tr key={syllabus._id}>
                          <td>{syllabus.studentId?.name || "N/A"}</td>
                          <td>{syllabus.typeId?.courseName || "N/A"}</td>
                          <td>{syllabus.staffId?.name || "N/A"}</td>
                          <td>
                            <span className={`status ${syllabus.status?.toLowerCase()}`}>
                              {syllabus.status}
                            </span>
                          </td>
                          <td>{syllabus.marks || "-"}</td>
                          <td>{syllabus.grade || "-"}</td>
                          <td>{syllabus.gpa || "-"}</td>
                          <td>{syllabus.attendance || "-"}%</td>
                          <td className="actions">
                            <button
                              className="btn-edit"
                              onClick={() => openMarkEntry(syllabus._id)}
                              disabled={loading}
                            >
                              📝 Marks
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(syllabus._id)}
                              disabled={loading}
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* Bulk Assign Tab */}
      {
        activeTab === "bulk-assign" && (
          <div className="bulk-assign-tab">
            <div className="bulk-assign-container">
              <h3>Bulk Assign Students to Course</h3>
              <form onSubmit={handleBulkAssign}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Select Course Type *</label>
                    <select
                      name="typeId"
                      value={bulkAssignForm.typeId}
                      onChange={handleBulkAssignChange}
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {types.map((type) => (
                        <option key={type._id} value={type._id}>
                          {type.courseName} ({type.courseCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Assign Staff *</label>
                    <select
                      name="staffId"
                      value={bulkAssignForm.staffId}
                      onChange={handleBulkAssignChange}
                      required
                    >
                      <option value="">-- Select Staff --</option>
                      {staff.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name || s.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Select Students * (Multi-select)</label>
                  <select
                    name="studentIds"
                    multiple
                    value={bulkAssignForm.studentIds}
                    onChange={handleBulkAssignChange}
                    size={8}
                    required
                  >
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.regNumber})
                      </option>
                    ))}
                  </select>
                  <small>Hold Ctrl/Cmd to select multiple students</small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-success" disabled={loading}>
                    {loading
                      ? "Assigning..."
                      : `Assign ${bulkAssignForm.studentIds.length} Students`}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setBulkAssignForm({
                        typeId: "",
                        staffId: "",
                        courseId: "",
                        studentIds: [],
                      });
                      setError("");
                    }}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Mark Entry Tab */}
      {
        activeTab === "mark-entry" && (
          <div className="mark-entry-tab">
            <div className="mark-entry-container">
              <h3>
                {editingSyllabusId ? "Enter/Update Marks for Student" : "Select a Syllabus to Enter Marks"}
              </h3>

              {editingSyllabusId && (
                <form onSubmit={handleMarkEntry}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Marks (0-100) *</label>
                      <input
                        type="number"
                        name="marks"
                        value={markEntryForm.marks}
                        onChange={handleMarkEntryChange}
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Grade *</label>
                      <select
                        name="grade"
                        value={markEntryForm.grade}
                        onChange={handleMarkEntryChange}
                        required
                      >
                        <option value="">-- Select Grade --</option>
                        <option value="A">A (90-100)</option>
                        <option value="A-">A- (85-89)</option>
                        <option value="B+">B+ (80-84)</option>
                        <option value="B">B (75-79)</option>
                        <option value="B-">B- (70-74)</option>
                        <option value="C+">C+ (65-69)</option>
                        <option value="C">C (60-64)</option>
                        <option value="C-">C- (55-59)</option>
                        <option value="D">D (50-54)</option>
                        <option value="F">F (Below 50)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>GPA (0-4) *</label>
                      <input
                        type="number"
                        name="gpa"
                        value={markEntryForm.gpa}
                        onChange={handleMarkEntryChange}
                        min="0"
                        max="4"
                        step="0.1"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Attendance (%)</label>
                      <input
                        type="number"
                        name="attendance"
                        value={markEntryForm.attendance}
                        onChange={handleMarkEntryChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-success" disabled={loading}>
                      {loading ? "Saving..." : "Save Marks"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setActiveTab("view");
                        setEditingSyllabusId(null);
                        setError("");
                      }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
};

export default SyllabusManagement;


