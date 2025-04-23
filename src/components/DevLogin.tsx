import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const DevLogin: React.FC = () => {
  const { user, devLogin, logout } = useAuth();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      <Button
        onClick={() => (user ? logout() : devLogin())}
        variant={user ? "destructive" : "default"}
      >
        {user ? 'Dev Logout' : 'Dev Login'}
      </Button>
      {user && (
        <div className="bg-white p-2 rounded-lg shadow-lg text-sm">
          Logged in as: {user.displayName}
        </div>
      )}
    </div>
  );
};

export default DevLogin; 