import React from 'react';
import { Link } from 'react-router-dom';

const LoginOptions = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Login Options</h2>
      <div className="flex flex-col space-y-4">
        <Link to="/student-login" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
          Login as Student
        </Link>
        <Link to="/educator-login" className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700">
          Login as Educator/Admin
        </Link>
      </div>
    </div>
  );
};

export default LoginOptions;
