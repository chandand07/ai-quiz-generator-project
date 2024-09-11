// src/components/EducatorSignup.jsx
import React, { useState } from 'react';

const EducatorSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [school, setSchool] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle signup
    alert(`Signup successful for: ${name}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Educator/Admin Signup</h2>
      <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
          <label className="block text-gray-700 mb-2">School</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Enter school"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
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
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Re-enter Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EducatorSignup;
