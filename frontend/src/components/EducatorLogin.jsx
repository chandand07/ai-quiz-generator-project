// src/components/EducatorLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EducatorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for authentication can go here
    alert(`Logged in as Educator/Admin: ${email}`);
    navigate('/educator-dashboard'); // Redirect to educator dashboard after login
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Educator/Admin Login</h2>
      <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-700">
          Login
        </button>
        <div className="mt-4 text-center">
          <span>New User? </span>
          <a href="/educator-signup" className="text-blue-500">Signup Now</a>
        </div>
      </form>
    </div>
  );
};

export default EducatorLogin;
