import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { Camera, Edit2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const ProfilePage: React.FC = () => {
  const { theme } = useTheme();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, userDetails } = useAuth();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 1000000) {
      alert('Image must be smaller than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const sidebarItems = [
    { label: 'Profile', path: '/profile' },
    { label: 'Connections', path: '/connections' },
    { label: 'Groups', path: '/profilegroups' },
    { label: 'Forums', path: '/forums' },
    { label: 'My Activity', path: null }
  ];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#fdf0eb]' : 'bg-[#001F1F]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex space-x-8">
        {/* Left Column: Profile Card and Sidebar */}
        <div className="flex flex-col w-80">
          {/* Profile Card */}
          <div className={`shadow-sm rounded-xl p-6 mb-4 ${theme === 'light' ? 'bg-white' : 'bg-[#072E2E]'}`}>
            <div className="relative group">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden relative mx-auto">
                {userDetails?.photoURL ? (
                  <img 
                    src={userDetails.photoURL} 
                    alt={user.displayName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={'/default-avatar.png'}
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="avatarUpload"
                />
                <label
                  htmlFor="avatarUpload"
                  className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
              </div>
              <div className="absolute bottom-0 right-8 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="mt-2 text-center">
              <h1 className={`text-lg font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.firstName} {userDetails.lastName}</h1>
              <div className={`mt-1 text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>
                @{user.username || user.displayName?.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#fdf0eb] text-[#2A363B]">
                {userDetails.role}
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <nav className={`rounded-xl shadow-sm p-6 sticky top-8 ${theme === 'light' ? 'bg-white' : 'bg-[#072E2E]'}`}>
            {sidebarItems.map((item) => (
              item.path ? (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    window.location.pathname === item.path
                      ? 'bg-[#0E4F52] text-white'
                      : theme === 'light'
                        ? 'text-[#2A363B] hover:bg-[#0E4F52]/20 hover:text-[#0E4F52]'
                        : 'text-white hover:bg-[#0E4F52]/20'
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <div
                  key={item.label}
                  className={`block px-4 py-3 rounded-lg text-base font-medium opacity-60 cursor-default select-none bg-transparent ${theme === 'light' ? 'text-[#2A363B]' : 'text-white'}`}
                >
                  {item.label}
                </div>
              )
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className={`rounded-xl shadow-sm p-8 ${theme === 'light' ? 'bg-white' : 'bg-[#072E2E]'}`}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Profile Details</h2>
              <button 
                onClick={() => navigate('/account')}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-3 gap-4">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>First Name</div>
                <div className={`col-span-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.firstName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>Last Name</div>
                <div className={`col-span-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.lastName}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>Nickname</div>
                <div className={`col-span-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.nickname}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>College</div>
                <div className={`col-span-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.college}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-300'}`}>Role</div>
                <div className={`col-span-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{userDetails.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;