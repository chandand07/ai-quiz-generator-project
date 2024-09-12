import React, { useState } from 'react';
import { useNavigate , Link} from 'react-router-dom';

const StudentSignup = () => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, rollNo, school, email, password, role: 'student' }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate('/student-login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Student Signup</h2>
      <form className="bg-white p-6 rounded-lg shadow-lg w-80" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Roll No.</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter roll no." value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">School</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter school" value={school} onChange={(e) => setSchool(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Re-enter Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        <button type="submit" className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};
export default StudentSignup;