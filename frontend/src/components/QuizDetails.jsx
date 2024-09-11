import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizDetails = () => {
  const [quizCode, setQuizCode] = useState('');
  const [subject, setSubject] = useState('');  // Add this line
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quizCode && subject && testDate && testTime) {  // Update this line
      navigate('/create-quiz', { state: { quizCode, subject, testDate, testTime } });  // Update this line
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">New Quiz Details</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quizCode">
            Quiz Code
          </label>
          <input
            type="text"
            id="quizCode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={quizCode}
            onChange={(e) => setQuizCode(e.target.value)}
            required
          />
        </div>
        {/* Add this new field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testDate">
            Test Date
          </label>
          <input
            type="date"
            id="testDate"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testTime">
            Test Time
          </label>
          <input
            type="time"
            id="testTime"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={testTime}
            onChange={(e) => setTestTime(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizDetails;