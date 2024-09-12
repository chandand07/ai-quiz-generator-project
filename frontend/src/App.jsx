import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LoginOptions />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/quiz-code" element={<QuizCode />} />
        <Route path="/educator-login" element={<EducatorLogin />} />
        <Route path="/educator-signup" element={<EducatorSignup />} />
        <Route path="/educator-dashboard" element={<EducatorDashboard />} />
        <Route path="/quiz-details" element={<QuizDetails />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path='/student-quiz' element={<StudentQuiz/>}/>
      </Routes>
    </Router>
  );
}

export default App;