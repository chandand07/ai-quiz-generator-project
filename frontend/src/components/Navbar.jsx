// src/components/Navbar.jsx
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">Quiz Generator</div>
        <div>
          <a href="#" className="px-4">Home</a>
          <a href="#" className="px-4">About</a>
          <a href="#" className="px-4">Contact</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
