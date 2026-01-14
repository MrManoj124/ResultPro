// ===== App.js =====
/*import React, { useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// ===== COMPONENT IMPORTS =====
import FrontPage from "./components/frontpage";
import Login from "./components/login";
import StudentDashboard from "./components/StudentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import StaffDashboard from "./components/StaffDashboard";
import StudentDetails from "./components/StudentDetails";
import CourseDetails from './components/CourseDetails';
import ResultDetails from './components/ResultDetails';
import ForgotPassword from "./components/ForgotPassword";

import "./index.css";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // ===== LOGIN FUNCTION =====
  const handleLogin = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (res.data && res.data.user) {
        const { user, token } = res.data;
        // Optionally store token in localStorage if needed for persistence
        // localStorage.setItem('token', token); 
        setCurrentUser(user);

        // Navigate based on role
        if (user.role === "admin") navigate("/admin");
        else if (user.role === "student") navigate("/student");
        else if (user.role === "staff") navigate("/staff");
        else alert("Unknown role: " + user.role);
      }
    } catch (err) {
      console.error("Login Failed:", err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // ===== LOGOUT FUNCTION =====
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  // ===== ROUTES =====
  return (
    <Routes>
      {/* FRONT PAGE */}
<Route path="/" element={<FrontPage />} />

{/* LOGIN PAGE */ }
<Route
  path="/login"
  element={<Login handleLogin={handleLogin} />}
/>

{/* ===== DASHBOARDS ===== */ }
      <Route
        path="/student"
        element={
          currentUser && currentUser.role === "student" ? (
            <StudentDashboard
              user={currentUser}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/staff"
        element={
          currentUser && currentUser.role === "staff" ? (
            <StaffDashboard
              user={currentUser}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          currentUser && currentUser.role === "admin" ? (
            <AdminDashboard
              user={currentUser}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/studentDetails" element={<StudentDetails />} />

      <Route
        path="/resultDetails"
        element={
          currentUser && currentUser.role === "admin" ? (
            <ResultDetails />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/courseDetails" element={<CourseDetails />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes >
  );
}

export default AppWrapper;
// ===== END OF App.js =====