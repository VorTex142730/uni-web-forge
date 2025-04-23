import React from 'react';
import { useParams } from 'react-router-dom';

const Timeline: React.FC = () => {
  const { username } = useParams();
  
  // Mock data - in a real app, you would fetch this from an API
  const userData = {
    firstName: "Riya",
    lastName: "Rane",
    nickname: "Riya",
    username: "@Riya",
    joinedDate: "Apr 2025",
    isActive: true
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with logo and search */}
    

      {/* Profile Header Banner */}
      <div className="relative">
        <div className="bg-gray-500 h-48 bg-opacity-50"></div>
        <div className="absolute left-8 -bottom-16">
          <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white">
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute top-0 right-0">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-2">{userData.firstName}</h2>
          <span className="bg-blue-100 text-blue-500 text-xs px-2 py-1 rounded">Student</span>
        </div>
        <div className="text-gray-500 mt-1">
          {userData.username} • Joined {userData.joinedDate} • {userData.isActive ? 'Active now' : 'Offline'}
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-8 px-8 flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-4">
          <nav className="space-y-1">
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Profile</div>
            <div className="px-4 py-2 text-blue-500 font-medium border-l-4 border-blue-500">Timeline</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Connections</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Groups</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Videos</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Photos</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Forums</div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          {/* Post Creator */}
          <div className="bg-white border rounded-md p-4 mb-4">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <textarea 
                className="flex-1 border rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
                placeholder="Share what's on your mind, Riya..."
                rows={2}
              ></textarea>
            </div>
            <div className="flex mt-3">
              <div className="flex space-x-2 ml-12">
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button className="flex items-center text-gray-500 hover:text-gray-700">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* No Activity Message */}
          <div className="bg-white border rounded-md p-4">
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600">Sorry, there was no activity found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;