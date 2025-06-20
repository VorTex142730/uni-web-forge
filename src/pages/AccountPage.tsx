import { useState, useEffect, useRef } from 'react';
import { Eye, Info, User, Bell, Lock, Users, UsersRound, Download, Camera } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  updateEmail,
  updateProfile
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AccountSettings = () => {
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [college, setCollege] = useState('');
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('edit-profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userDetails) {
      setEmail(user.email || '');
      setFirstName(userDetails.firstName || '');
      setLastName(userDetails.lastName || '');
      setNickname(userDetails.nickname || '');
      setCollege(userDetails.college || '');
      fetchProfilePhoto();
    }
  }, [user, userDetails]);

  const fetchProfilePhoto = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPhotoURL(data.photoURL || null);
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 1000000) {
      toast.error('Image must be smaller than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
        setUploading(true);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          photoURL: base64String,
          updatedAt: new Date().toISOString(),
        });
        setPhotoURL(base64String);
        toast.success('Profile picture updated successfully');
      } catch (error: any) {
        console.error('Error updating profile picture:', error);
        toast.error('Error updating profile picture');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
  };

  const handleReauthenticate = async (currentPassword: string) => {
    if (!user?.email) return false;
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error('Reauthentication failed:', error);
      return false;
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        toast.error('No user logged in');
        return;
      }

      if (currentPassword) {
        const isReauthenticated = await handleReauthenticate(currentPassword);
        if (!isReauthenticated) {
          toast.error('Current password is incorrect');
          return;
        }

        if (email !== user.email) {
          await updateEmail(user, email);
          toast.success('Email updated successfully');
        }

        if (newPassword) {
          if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
          }
          await updatePassword(user, newPassword);
          toast.success('Password updated successfully');
          setNewPassword('');
          setConfirmPassword('');
        }
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        nickname,
        college,
        updatedAt: new Date().toISOString(),
      });

      toast.success('Profile updated successfully');
      setCurrentPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'edit-profile', label: 'Edit Profile', icon: <User size={18} /> },
    { id: 'profile-photo', label: 'Profile Photo', icon: <Camera size={18} /> },
  ];

  if (!user || !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center text-gray-700 font-medium"
          >
            <User size={18} className="mr-2" />
            View Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex">
            <div className="w-1/4 border-r border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center w-full py-4 px-5 text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-3/4 p-8">
              {activeTab === 'edit-profile' && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Profile Information</h2>
                  <form onSubmit={handleSaveChanges}>
                    <div className="mb-6">
                      <label className="block text-gray-600 mb-2">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-600 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-600 mb-2">Nickname</label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-600 mb-2">College</label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-gray-600 mb-2">Account Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </>
              )}

              {activeTab === 'profile-photo' && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Photo</h2>
                  <div className="mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                          {photoURL ? (
                            <img 
                              src={photoURL} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img 
                              src={'/default-avatar.png'}
                              alt="Default Avatar"
                              className="w-full h-full rounded-full object-cover"
                            />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="avatarUpload"
                          ref={profileFileInputRef}
                        />
                        <label
                          htmlFor="avatarUpload"
                          className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera className="w-6 h-6 text-white" />
                        </label>
                      </div>
                      <div className="flex-1">
                        {uploading ? (
                          <p className="text-gray-600">Uploading...</p>
                        ) : (
                          <button
                            onClick={() => profileFileInputRef.current?.click()}
                            className="text-blue-600 hover:underline"
                          >
                            Upload New Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;