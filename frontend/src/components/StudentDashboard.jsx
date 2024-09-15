import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentDashboard = () => {
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [pastTests, setPastTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/quiz/student-quizzes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
          setUpcomingTests(data.quizzes.filter(quiz => !quiz.attempted && !quiz.ended));
          setPastTests(data.quizzes.filter(quiz => quiz.attempted || quiz.ended));
        } else {
          setError(data.message || 'Failed to fetch quizzes');
        }
      } catch (error) {
        setError('Error fetching quizzes. Please try again later.');
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    const fetchQuizResults = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/student-quiz-results', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'success') {
          setQuizResults(data.results);
        } else {
          console.error('Failed to fetch quiz results:', data.message);
        }
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      }
    };

    fetchQuizzes();
    fetchQuizResults();
    checkUpcomingTests();

    
    const timer = setInterval(checkUpcomingTests, 60000);

    
    return () => clearInterval(timer);
  }, [location.state?.quizSubmitted]);

  const checkUpcomingTests = () => {
    const now = new Date();
    upcomingTests.forEach(test => {
      const testDate = new Date(test.testDate);
      const [hours, minutes] = test.testTime.split(':');
      const testStartTime = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate(), parseInt(hours), parseInt(minutes));
      const timeDiff = testStartTime.getTime() - now.getTime();
  
      if (timeDiff > 0 && timeDiff <= 60000) { 
        alert(`Your test "${test.subject}" is starting in 1 minute!`);
      } else if (timeDiff <= 0 && timeDiff > -60000) { 
        alert(`Your test "${test.subject}" has started!`);
        handleTakeTest(test);
      }
    });
  };

  const handleTakeTest = (test) => {
    const now = new Date();
    const testDate = new Date(test.testDate);
    const [hours, minutes] = test.testTime.split(':');
    const testStartTime = new Date(testDate.getFullYear(), testDate.getMonth(), testDate.getDate(), parseInt(hours), parseInt(minutes));
    const testEndTime = new Date(testStartTime.getTime() + test.testDuration * 60000);
  
    if (now < testStartTime) {
      alert(`The test hasn't started yet. It will begin at ${testStartTime.toLocaleString()}.`);
    } else if (now > testEndTime) {
      alert('The test has already ended.');
    } else {
      navigate('/quiz-code', { 
        state: { 
          quizId: test._id,
          subject: test.subject,
          testDate: test.testDate,
          testTime: test.testTime
        } 
      });
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      {/* Upcoming Tests Table */}
      <h2 className="text-2xl font-bold mb-4">Upcoming Tests</h2>
      {upcomingTests.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded-lg mb-8">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">S.No</th>
              <th className="py-2 px-4 border">Test Date</th>
              <th className="py-2 px-4 border">Subject</th>
              <th className="py-2 px-4 border">Test Time</th>
              <th className="py-2 px-4 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {upcomingTests.map((test, index) => (
              <tr key={test._id}>
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">{new Date(test.testDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{test.subject}</td>
                <td className="py-2 px-4 border">{test.testTime}</td>
                <td className="py-2 px-4 border">
                  <button
                    onClick={() => handleTakeTest(test)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                  >
                    Take Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center mt-4">No upcoming tests available.</p>
      )}
      <h2 className="text-2xl font-bold mb-4">Test Results</h2>
      {quizResults.length > 0 ? (
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border">S.No</th>
              <th className="py-2 px-4 border">Subject</th>
              <th className="py-2 px-4 border">Test Date</th>
              <th className="py-2 px-4 border">Score</th>
              <th className="py-2 px-4 border">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {quizResults.map((result, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border">{index + 1}</td>
                <td className="py-2 px-4 border">{result.subject}</td>
                <td className="py-2 px-4 border">{new Date(result.testDate).toLocaleDateString()}</td>
                <td className="py-2 px-4 border">{result.score}/{result.totalQuestions}</td>
                <td className="py-2 px-4 border">{new Date(result.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center mt-4">No test results available.</p>
      )}
    </div>
  );
};

export default StudentDashboard;