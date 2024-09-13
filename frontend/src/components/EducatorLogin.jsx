import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EducatorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, teacherId, role: 'educator' }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.data.user.role);
        navigate('/educator-dashboard');
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
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
            required
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
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Teacher ID</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter teacher ID"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-700">
          Login
        </button>
        <div className="mt-4 text-center">
          <span>New User? </span>
          <Link to="/educator-signup" className="text-blue-500">Signup Now</Link>
        </div>
      </form>
    </div>
  );
};

export default EducatorLogin;