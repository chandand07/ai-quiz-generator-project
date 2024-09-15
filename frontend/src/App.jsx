import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginOptions from './components/LoginOptions';
import StudentLogin from './components/StudentLogin';
import StudentSignup from './components/StudentsSignup';
import StudentDashboard from './components/StudentDashboard';
import QuizCode from './components/QuizCode';
import EducatorLogin from './components/EducatorLogin';
import EducatorSignup from './components/EducatorSignup';
import EducatorDashboard from './components/EducatorDashboard';
import QuizDetails from './components/QuizDetails';
import CreateQuiz from './components/CreateQuiz';
import StudentQuiz from './components/StudentQuiz';
import QuizResults from './components/QuizResults';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginOptions />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz-code" 
          element={
            <ProtectedRoute allowedRole="student">
              <QuizCode />
            </ProtectedRoute>
          } 
        />
        <Route path="/educator-login" element={<EducatorLogin />} />
        <Route path="/educator-signup" element={<EducatorSignup />} />
        <Route 
          path="/educator-dashboard" 
          element={
            <ProtectedRoute allowedRole="educator">
              <EducatorDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz-details" 
          
          element={
            <ProtectedRoute allowedRole="educator">
              <QuizDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-quiz" 
          element={
            <ProtectedRoute allowedRole="educator">
              <CreateQuiz />
            </ProtectedRoute>
          } 
        />
        <Route 
          path='/student-quiz' 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentQuiz />
            </ProtectedRoute>
          }
        />
        <Route path="/quiz-results/:quizId" element={<QuizResults />} />
      </Routes>
    </Router>
  );
}

export default App;