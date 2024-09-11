import React from 'react';
import { Link } from 'react-router-dom';

const EducatorDashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Educator Dashboard</h1>
      <Link
        to="/quiz-details"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 inline-block"
      >
        Make a New Quiz
      </Link>
      
      {/* Quizzes Table */}
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
          {/* Sample data - replace with actual data from your state or API */}
          <tr>
            <td className="py-2 px-4 border">MATH101</td>
            <td className="py-2 px-4 border">Mathematics</td>
            <td className="py-2 px-4 border">2024-09-15</td>
            <td className="py-2 px-4 border">10:00 AM</td>
            <td className="py-2 px-4 border">
              
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                Show Results
              </button>
            </td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default EducatorDashboard;