import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuizDetails = () => {
  const [quizCode, setQuizCode] = useState('');
  const [subject, setSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testDuration, setTestDuration] = useState('');
  const [quizClass, setQuizClass] = useState('');
  const [section, setSection] = useState('');
  const navigate = useNavigate();


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const quizData = { 
      quizCode, 
      subject, 
      testDate, 
      testTime, 
      testDuration: parseInt(testDuration),
      class: parseInt(quizClass),
      section
    };
    console.log('Sending quiz data:', quizData);
    const response = await fetch('http://localhost:5000/api/quiz/details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(quizData),
    });
    const data = await response.json();
    console.log('Response from server:', data);
    if (response.ok) {
      navigate('/create-quiz', { 
        state: { 
          quizId: data.quizId,
          quizDetails: quizData 
        } 
      });
    } else {
      throw new Error(data.message || 'Failed to save quiz details');
    }
  } catch (error) {
    console.error('Error saving quiz details:', error);
    alert(error.message || 'An error occurred. Please try again.');
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
        <div className="mb-4">
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="testDuration">
            Test Duration (minutes)
          </label>
          <input
            type="number"
            id="testDuration"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={testDuration}
            onChange={(e) => setTestDuration(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quizClass">
            Class
          </label>
          <select
            id="quizClass"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={quizClass}
            onChange={(e) => setQuizClass(e.target.value)}
            required
          >
            <option value="">Select Class</option>
            {[...Array(9)].map((_, i) => (
              <option key={i} value={i + 4}>{i + 4}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="section">
            Section
          </label>
          <select
            id="section"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            required
          >
            <option value="">Select Section</option>
            {['A', 'B', 'C', 'D'].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
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