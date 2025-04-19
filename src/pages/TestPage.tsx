import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const TestPage = () => {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
      alert('You have been logged out.');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserDetails(userDoc.data()); // Set the user details in state
          } else {
            console.error('No such user document!');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    fetchUserDetails();
  }, [user]);

  return (
    <div>
      <h1>Test Page</h1>
      {user ? (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {userDetails ? (
            <div>
              <p>
                <strong>First Name:</strong> {userDetails.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {userDetails.lastName}
              </p>
              <p>
                <strong>Nickname:</strong> {userDetails.nickname}
              </p>
              <p>
                <strong>College:</strong> {userDetails.college}
              </p>
              <p>
                <strong>Role:</strong> {userDetails.role}
              </p>
            </div>
          ) : (
            <p>Loading user details...</p>
          )}
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