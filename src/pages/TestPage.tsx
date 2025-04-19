import React from 'react';
import { useAuth } from '@/context/AuthContext';

const TestPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      alert('You have been logged out.');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div>
      <h1>Test Page</h1>
      {user ? (
        <div>
          <p>
            <strong>Username:</strong> {user.displayName || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>No user is logged in.</p>
      )}
    </div>
  );
};

export default TestPage;