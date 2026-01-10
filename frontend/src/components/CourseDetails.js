import React, { useState } from "react";
import "../CSS/CourseDetails.css";

function CourseDetails() {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const courses = [
    {
      code: "ITI113",
      name: "Fundamentals of Information Technology",
      credits: 1,
      instructor: "Dr. Smith",
      semester: "First Semester",
      level: "Level 1",
      description: "Introduction to IT concepts and fundamentals."
    },
    {
      code: "ITI122",
      name: "Foundation of Mathematics",
      credits: 2,
      instructor: "Prof. Johnson",
      semester: "First Semester",
      level: "Level 1",
      description: "Mathematical foundations for IT students."
    },
    {
      code: "ITI134",
      name: "Fundamentals of Programming",
      credits: 4,
      instructor: "Dr. Williams",
      semester: "First Semester",
      level: "Level 1",
      description: "Introduction to programming using Python."
    },
    {
      code: "ITI144",
      name: "Fundamentals of Web Programming",
      credits: 4,
      instructor: "Mr. Brown",
      semester: "First Semester",
      level: "Level 1",
      description: "Web development with HTML, CSS, and JavaScript."
    },
    {
      code: "ITI152",
      name: "Essentials of Statistics",
      credits: 2,
      instructor: "Dr. Davis",
      semester: "First Semester",
      level: "Level 1",
      description: "Statistical methods and analysis."
    },
    {
      code: "ACU113",
      name: "English Language I",
      credits: 3,
      instructor: "Prof. Miller",
      semester: "First Semester",
      level: "Level 1",
      description: "English language and communication skills."
    },
  ];

  return (
    <div className="course-details-container">
      <header className="course-header">
        <h1>🎓 Course Details</h1>
      </header>

      <div className="courses-grid">
        {courses.map((course) => (
          <div
            key={course.code}
            className="course-card"
            onClick={() => setSelectedCourse(course)}
          >
            <div className="course-code">{course.code}</div>
            <div className="course-name">{course.name}</div>
            <div className="course-meta">
              <span>Credits: {course.credits}</span>
              <span>{course.level}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="course-modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedCourse(null)}
            >
              ✕
            </button>
            <h2>{selectedCourse.name}</h2>
            <div className="modal-content">
              <p><strong>Course Code:</strong> {selectedCourse.code}</p>
              <p><strong>Credits:</strong> {selectedCourse.credits}</p>
              <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
              <p><strong>Level:</strong> {selectedCourse.level}</p>
              <p><strong>Semester:</strong> {selectedCourse.semester}</p>
              <p><strong>Description:</strong> {selectedCourse.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
