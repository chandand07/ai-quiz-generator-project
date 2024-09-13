import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const EducatorDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data.quizzes);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      alert('Failed to load quizzes. Please try again.');
    }
  };

  const handleShowResults = (quiz) => {
    const quizEndTime = new Date(quiz.testDate + 'T' + quiz.testTime);
    quizEndTime.setMinutes(quizEndTime.getMinutes() + quiz.testDuration);
    
    if (new Date() < quizEndTime) {
      alert('The quiz has not completed yet. Results are not available.');
    } else {
      // Navigate to results page or show results modal
      alert('Showing results for quiz: ' + quiz.quizCode);
      // You can implement the actual results display logic here
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Educator Dashboard</h1>
      <Link
        to="/quiz-details"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 inline-block"
      >
        Make a New Quiz
      </Link>
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Your Quizzes</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">Quiz Code</th>
            <th className="py-2 px-4 border">Subject</th>
            <th className="py-2 px-4 border">Date</th>
            <th className="py-2 px-4 border">Time</th>
            <th className="py-2 px-4 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz._id}>
              <td className="py-2 px-4 border">{quiz.quizCode}</td>
              <td className="py-2 px-4 border">{quiz.subject}</td>
              <td className="py-2 px-4 border">{quiz.testDate}</td>
              <td className="py-2 px-4 border">{quiz.testTime}</td>
              <td className="py-2 px-4 border">
                <button 
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleShowResults(quiz)}
                >
                  Show Results
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EducatorDashboard;