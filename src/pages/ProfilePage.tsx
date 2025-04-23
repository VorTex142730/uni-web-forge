import React from 'react';
import { useParams } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { username } = useParams();
  
  // Mock data - in a real app, you would fetch this from an API
  const userData = {
    firstName: "Riya",
    lastName: "Rane",
    nickname: "Riya",
    college: "Vidyalankar Institute of technology",
    role: "Student",
    username: "@Riya",
    joinedDate: "Apr 2025",
    isActive: true
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header with logo and search */}
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">HotSpoT</h1>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-4 py-2 bg-gray-100 rounded-lg"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10M7 16h10" />
            </svg>
          </button>
          <button>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
          <div className="flex items-center">
            <span className="mr-2">Riya</span>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </header>

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
            <div className="px-4 py-2 text-blue-500 font-medium border-l-4 border-blue-500">Profile</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Timeline</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Connections</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Groups</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Videos</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Photos</div>
            <div className="px-4 py-2 text-gray-600 hover:bg-gray-50">Forums</div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="bg-white border rounded-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Details</h3>
              <button className="text-blue-500 hover:underline">Edit</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/3 text-gray-500">First Name</div>
                <div className="w-2/3">{userData.firstName}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Last Name</div>
                <div className="w-2/3">{userData.lastName}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Nickname</div>
                <div className="w-2/3">{userData.nickname}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">College name</div>
                <div className="w-2/3">{userData.college}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Role</div>
                <div className="w-2/3">{userData.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;