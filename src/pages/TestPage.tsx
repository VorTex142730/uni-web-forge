import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfilePhoto = () => {
  const { user, userDetails } = useAuth();

  if (!user) {
    return <div>Not logged in</div>;
  }

  // Use photoURL from either userDetails or the auth user object
  const photoURL = userDetails?.photoURL || user.photoURL;

  // Get initials for fallback
  const getInitials = () => {
    if (userDetails?.firstName && userDetails?.lastName) {
      return `${userDetails.firstName[0]}${userDetails.lastName[0]}`.toUpperCase();
    }
    return user.displayName 
      ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'U';
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={photoURL} alt="Profile photo" />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-medium">
          {userDetails?.firstName || user.displayName} {userDetails?.lastName}
        </h2>
        <p className="text-sm text-gray-500">@{userDetails?.username || user.email?.split('@')[0]}</p>
      </div>
    </div>
  );
};

export default UserProfilePhoto;