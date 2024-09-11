// src/components/StudentDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  return (
    <div className="container mx-auto p-8">
      {/* Upcoming Tests Table */}
      <h2 className="text-2xl font-bold mb-4">Upcoming Tests</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">S.No</th>
            <th className="py-2 px-4 border">Test Date</th>
            <th className="py-2 px-4 border">Subject</th>
            <th className="py-2 px-4 border">Teacher</th>
            <th className="py-2 px-4 border">Test Time</th>
            <th className="py-2 px-4 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Dummy Data */}
          <tr>
            <td className="py-2 px-4 border">1</td>
            <td className="py-2 px-4 border">2024-09-15</td>
            <td className="py-2 px-4 border">Mathematics</td>
            <td className="py-2 px-4 border">Mr. John</td>
            <td className="py-2 px-4 border">10:00 AM</td>
            <td className="py-2 px-4 border">
              <Link to="/quiz-code" className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-700">
                Take Test
              </Link>
            </td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>

      {/* Test Results Table */}
      <h2 className="text-2xl font-bold mb-4">Test Results</h2>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">S.No</th>
            <th className="py-2 px-4 border">Subject</th>
            <th className="py-2 px-4 border">Test Date</th>
            <th className="py-2 px-4 border">Total Marks</th>
            <th className="py-2 px-4 border">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {/* Dummy Data */}
          <tr>
            <td className="py-2 px-4 border">1</td>
            <td className="py-2 px-4 border">Mathematics</td>
            <td className="py-2 px-4 border">2024-09-01</td>
            <td className="py-2 px-4 border">85/100</td>
            <td className="py-2 px-4 border">Good</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default StudentDashboard;
