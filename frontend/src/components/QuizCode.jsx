import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizCode = () => {
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId, subject, testDate, testTime } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quizId, quizCode })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        navigate('/student-quiz', { 
          state: { 
            quizId,
            quizCode, 
            subject,
            testDate,
            testTime,
            questions: data.quiz.questions,
            duration: data.quiz.testDuration
          } 
        });
      } else {
        alert(data.message || 'Invalid quiz code');
      }
    } catch (error) {
      console.error('Error verifying quiz code:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-6">Enter Quiz Code</h2>
      <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quiz Code</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter quiz code"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="bg-green-500 text-white py-2 w-full rounded hover:bg-green-700">
          Start Quiz
        </button>
      </form>
    </div>
  );
};

export default QuizCode;