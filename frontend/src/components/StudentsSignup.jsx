import React from 'react';

const StudentSignup = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-4">Student Signup</h2>
      <form className="bg-white p-6 rounded-lg shadow-lg w-80">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter name" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Roll No.</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter roll no." />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">School</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="Enter school" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="Enter email" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="Enter password" />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Re-enter Password</label>
          <input type="password" className="w-full p-2 border rounded" placeholder="Re-enter password" />
        </div>
        <button className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-700">
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentSignup;
