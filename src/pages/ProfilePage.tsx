import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const ProfilePage: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, userDetails } = useAuth();

  // Add this function to handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 1000000) { // 1MB limit
      alert('Image must be smaller than 1MB');
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
        // Update user document in Firestore
        const db = getFirestore();
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: base64String
        });
        alert('Profile picture updated successfully');
      } catch (error) {
        console.error('Error updating profile picture:', error);
        alert('Error updating profile picture');
      }
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
  };

  if (!user || !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const sidebarItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'Timeline', path: '/timeline' },
    { label: 'Connections', path: '/connections' },
    { label: 'Groups', path: '/groups' },
    { label: 'Videos', path: '/videos' },
    { label: 'Photos', path: '/photos' },
    { label: 'Forums', path: '/forums' },
    { label: 'Blog', path: '/blog' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Profile Header Banner */}
      <div className="relative">
        <div className="bg-gray-500 h-48 bg-opacity-50"></div>
        <div className="absolute left-8 -bottom-16">
          {/* Avatar Section */}
          <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white relative">
            {userDetails?.photoURL ? (
              <img 
                src={userDetails.photoURL} 
                alt={user.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            
            {/* Add upload functionality */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="avatarUpload"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
            >
              <span className="text-white text-sm">Upload</span>
            </label>
          </div>
          <div className="absolute top-0 right-0">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-2">{userDetails.firstName}</h2>
          <span className="bg-blue-100 text-blue-500 text-xs px-2 py-1 rounded">{userDetails.role}</span>
        </div>
        <div className="text-gray-500 mt-1">
          @{user.username || user.displayName?.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} • Active now
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-8 px-8 flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`block px-4 py-2 ${
                  window.location.pathname === item.path
                    ? 'text-blue-500 font-medium border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="bg-white border rounded-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Details</h3>
              <button 
                onClick={() => navigate('/account')}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/3 text-gray-500">First Name</div>
                <div className="w-2/3">{userDetails.firstName}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Last Name</div>
                <div className="w-2/3">{userDetails.lastName}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Nickname</div>
                <div className="w-2/3">{userDetails.nickname}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">College name</div>
                <div className="w-2/3">{userDetails.college}</div>
              </div>
              <div className="flex">
                <div className="w-1/3 text-gray-500">Role</div>
                <div className="w-2/3">{userDetails.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;