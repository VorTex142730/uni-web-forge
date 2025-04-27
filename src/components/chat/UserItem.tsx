import React from 'react';
import { useNavigate } from 'react-router-dom';
import { checkChatExists, getOrCreateChat } from '../../services/chatService';

interface UserItemProps {
  user: {
    id: string;
    displayName: string;
    photoURL?: string;
    email?: string;
  };
  currentUserId: string;
  showChatButton?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ user, currentUserId, showChatButton = true }) => {
  const navigate = useNavigate();
  
  const handleStartChat = async () => {
    try {
      if (!currentUserId) {
        throw new Error('Current user not authenticated');
      }

      console.log('Attempting chat between:', {
        currentUser: currentUserId,
        targetUser: user.id
      });

      const existingChatId = await checkChatExists(currentUserId, user.id);

      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
      } else {
        const chatId = await getOrCreateChat(currentUserId, user.id);
        navigate(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error('Error starting chat:', {
        error,
        currentUser: currentUserId,
        targetUser: user.id
      });
      alert('Could not start chat. Please try again.');
    }
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg mb-2 shadow-sm">
      <div className="flex items-center">
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName} 
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <span className="text-lg font-medium text-gray-600">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-medium">{user.displayName}</h3>
          {user.email && <p className="text-sm text-gray-500">{user.email}</p>}
        </div>
      </div>
      
      {showChatButton && (
        <button 
          onClick={handleStartChat}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Chat
        </button>
      )}
    </div>
  );
};

export default UserItem;
