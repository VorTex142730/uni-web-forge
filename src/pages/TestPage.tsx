import React from "react";
import { useAuth } from "@/context/AuthContext";

const UserProfile: React.FC = () => {
  const { user, userDetails } = useAuth();

  if (!user) {
    return <div>No user is currently logged in.</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Logged-in User Info</h2>

      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {user.displayName || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>UID:</strong> {user.uid}
        </p>
        <p>
          <strong>Photo URL:</strong> {user.photoURL || "N/A"}
        </p>
      </div>

      {userDetails && (
        <div className="mt-6 space-y-2">
          <h3 className="font-semibold text-lg">Profile Details</h3>
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
          <p>
            <strong>Photo:</strong> {userDetails.photoURL || "N/A"}
          </p>
          <p>
            <strong>Cover Photo:</strong> {userDetails.coverPhotoURL || "N/A"}
          </p>
          <p>
            <strong>Created At:</strong> {userDetails.createdAt || "N/A"}
          </p>
          <p>
            <strong>Updated At:</strong> {userDetails.updatedAt || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
