import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo Icon */}
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-800">NeuroGuard AI</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-500 text-sm">System Status: <span className="text-green-500 font-semibold">Online</span></span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;