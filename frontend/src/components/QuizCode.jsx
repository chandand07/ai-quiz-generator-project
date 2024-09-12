// src/components/QuizCode.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizCode = () => {
  const [quizCode, setQuizCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Add logic to handle quiz submission
    navigate('/student-quiz', { 
      state: { 
        quizCode, 
        subject: 'Mathematics', 
        testDate: '2023-06-01' 
      } 
    });
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
          />
        </div>
        <button type="submit" className="bg-green-500 text-white py-2 w-full rounded hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default QuizCode;
