import { useState } from 'react';
import { Eye, Info, User, Bell, Lock, Users, UsersRound, Download } from 'lucide-react';

const AccountSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('raneriya46@gmail.com');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password update logic here
    console.log('Saving password changes');
  };

  const tabs = [
    { id: 'login', label: 'Login Information', icon: <User size={18} /> },
    { id: 'notification', label: 'Notification Settings', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock size={18} /> },
    { id: 'blocked', label: 'Blocked Members', icon: <Users size={18} /> },
    { id: 'group', label: 'Group Invites', icon: <UsersRound size={18} /> },
    { id: 'export', label: 'Export Data', icon: <Download size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
          <button className="flex items-center text-gray-700 font-medium">
            <User size={18} className="mr-2" />
            View Profile
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex">
            {/* Sidebar */}
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

            {/* Main content */}
            <div className="w-3/4 p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login Information</h2>

              <form onSubmit={handleSaveChanges}>
                <div className="mb-6">
                  <label className="block text-gray-600 mb-2">
                    Current Password (required to update email or change current password)
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                  <button className="text-red-500 mt-2 hover:underline">
                    Lost your password?
                  </button>
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

                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 flex items-start">
                  <Info size={20} className="text-blue-500 mr-3 mt-1" />
                  <p className="text-gray-700">Leave password fields blank for no change</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-600 mb-2">Add Your New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-600 mb-2">Repeat Your New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;