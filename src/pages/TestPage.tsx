// src/components/UserProfileDisplay.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext'; // Import your useAuth hook

const UserProfileDisplay: React.FC = () => {
  const { user, loading, userDetails } = useAuth();

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!user) {
    return <div>Please log in to see your profile.</div>;
  }

  // Now you can access user.photoURL
  const userPhoto = user.photoURL || (userDetails?.photoURL ? userDetails.photoURL : null);
  const displayName = user.displayName || userDetails?.firstName || user.username;

  return (
    <div>
      <h2>User Profile</h2>
      {userPhoto ? (
        <div>
          <img src={userPhoto} alt={`${displayName}'s profile`} style={{ width: 100, height: 100, borderRadius: '50%' }} />
          <p>Photo URL: {userPhoto}</p> {/* Display the URL */}
        </div>
      ) : (
        <p>No profile photo available.</p>
      )}
      <p>Display Name: {displayName}</p>
      <p>Username: {user.username}</p>
      {userDetails && (
          <>
              <p>First Name: {userDetails.firstName}</p>
              <p>Last Name: {userDetails.lastName}</p>
              {/* Add other userDetails fields you want to display */}
          </>
      )}

      {/* Example of how you might call updateProfile */}
      {/* <button onClick={() => user && updateUserProfile({ photoURL: 'https://example.com/new-photo.jpg' })}>Update Photo</button> */}
    </div>
  );
};

export default UserProfileDisplay;