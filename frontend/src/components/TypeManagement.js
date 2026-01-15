import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/TypeManagement.css";

const TypeManagement = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    courseUnit: 3,
    semester: "First",
    level: "Level 1",
    faculty: "Business",
    department: "",
    course: "",
    prerequisites: [],
    isActive: true,
  });

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ===== Fetch all Type courses =====
  const fetchTypes = async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      let url = `${API_URL}/api/type`;
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams(filters).toString();
        url += `?${queryParams}`;
      }

      const response = await axios.get(url);
      setTypes(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch courses: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Fetch types on component mount =====
  useEffect(() => {
    fetchTypes();
  }, []);

  // ===== Handle form input change =====
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===== Create new Type course =====
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/api/type`, formData);
      if (response.data.success) {
        alert("Course created successfully!");
        setFormData({
          courseName: "",
          courseCode: "",
          courseUnit: 3,
          semester: "First",
          level: "Level 1",
          faculty: "Business",
          department: "",
          course: "",
          prerequisites: [],
          isActive: true,
        });
        setShowForm(false);
        fetchTypes();
      }
    } catch (err) {
      setError("Failed to create course: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Edit Type course =====
  const handleEdit = (type) => {
    setFormData(type);
    setEditingId(type._id);
    setShowForm(true);
  };

  // ===== Update Type course =====
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.put(`${API_URL}/api/type/${editingId}`, formData);
      if (response.data.success) {
        alert("Course updated successfully!");
        setFormData({
          courseName: "",
          courseCode: "",
          courseUnit: 3,
          semester: "First",
          level: "Level 1",
          faculty: "Business",
          department: "",
          course: "",
          prerequisites: [],
          isActive: true,
        });
        setShowForm(false);
        setEditingId(null);
        fetchTypes();
      }
    } catch (err) {
      setError("Failed to update course: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Delete Type course =====
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setLoading(true);
    setError("");

    try {
      const response = await axios.delete(`${API_URL}/api/type/${id}`);
      if (response.data.success) {
        alert("Course deleted successfully!");
        fetchTypes();
      }
    } catch (err) {
      setError("Failed to delete course: " + err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Cancel form =====
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      courseName: "",
      courseCode: "",
      courseUnit: 3,
      semester: "First",
      level: "Level 1",
      faculty: "Business",
      department: "",
      course: "",
      prerequisites: [],
      isActive: true,
    });
    setError("");
  };

  return (
    <div className="type-management">
      <div className="type-header">
        <h2>📚 Course Type Management</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          disabled={loading}
        >
          {showForm ? "Cancel" : "+ Add New Course"}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Form Section */}
      {showForm && (
        <div className="type-form-container">
          <h3>{editingId ? "Edit Course Type" : "Create New Course Type"}</h3>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Course Name *</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  placeholder="e.g., Business Management 101"
                  required
                />
              </div>
              <div className="form-group">
                <label>Course Code *</label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  placeholder="e.g., BUS101"
                  required
                  disabled={editingId ? true : false}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course Units *</label>
                <input
                  type="number"
                  name="courseUnit"
                  value={formData.courseUnit}
                  onChange={handleInputChange}
                  min="1"
                  max="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Semester *</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                >
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Level *</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                </select>
              </div>
              <div className="form-group">
                <label>Faculty *</label>
                <select
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Applied Science">Applied Science</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., Business Management Dept"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sub-Department</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="Optional: e.g., ICT"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active Course
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Course" : "Create Course"}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && !showForm && <div className="loading">Loading...</div>}

      {/* Types List */}
      <div className="types-list">
        {types.length === 0 ? (
          <p className="no-data">No courses found. Create one to get started!</p>
        ) : (
          <div className="table-responsive">
            <table className="types-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Code</th>
                  <th>Units</th>
                  <th>Semester</th>
                  <th>Level</th>
                  <th>Faculty</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type._id}>
                    <td>{type.courseName}</td>
                    <td>{type.courseCode}</td>
                    <td>{type.courseUnit}</td>
                    <td>{type.semester}</td>
                    <td>{type.level}</td>
                    <td>{type.faculty}</td>
                    <td>{type.department}</td>
                    <td>
                      <span className={`status ${type.isActive ? "active" : "inactive"}`}>
                        {type.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(type)}
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(type._id)}
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
  );
};

export default TypeManagement;
