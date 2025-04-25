// GroupCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Group } from '@/types';
import { createGroupJoinRequestNotification } from '@/components/notifications/NotificationService';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
}

const GroupCard = ({ group, onClick }: GroupCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const generateGradient = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h1 = hash % 360;
    const h2 = (h1 + 40) % 360;
    return `bg-gradient-to-br from-[hsl(${h1},70%,60%)] to-[hsl(${h2},70%,50%)]`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleJoinGroup = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to join groups');
      return;
    }

    try {
      await addDoc(collection(db, 'groupJoinRequests'), {
        groupId: group.id,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Create notification for group owner
      await createGroupJoinRequestNotification(
        group.createdBy.userId,
        user.uid,
        user.displayName || 'Anonymous',
        group.id,
        group.name
      );

      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to send join request');
    }
  };

  const handleViewGroup = () => {
    navigate(`/groups/${group.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200" 
      onClick={onClick || handleViewGroup}
    >
      <div className={`h-32 relative flex items-center justify-center ${generateGradient(group.name)}`}>
        <span className="text-white text-2xl font-bold">
          {getInitials(group.name)}
        </span>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mt-auto mb-4">
          <span className="mr-4">
            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
          </span>
          <span className={`${group.privacy === 'private' ? 'text-orange-500' : 'text-green-500'}`}>
            {group.privacy}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleViewGroup();
            }}
            className="flex-1"
          >
            View Group
          </Button>
          <Button
            size="sm"
            onClick={handleJoinGroup}
            className="flex-1"
          >
            {group.privacy === 'private' ? 'Request Access' : 'Join Group'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;