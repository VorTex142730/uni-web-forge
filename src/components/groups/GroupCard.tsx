// GroupCard.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description?: string;
    privacy: 'public' | 'private';
    coverImage?: string;
    lastActive: string;
    memberCount: number;
    isMember?: boolean;
  };
  onJoin: () => void;
  onView: () => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, onView }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const formatLastActive = (date: string) => {
    try {
      return `Active ${formatDistanceToNow(new Date(date), { addSuffix: true })}`;
    } catch {
      return 'Recently active';
    }
  };

  const generateGradient = (text: string) => {
    // Generate a consistent color based on the text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h1 = hash % 360;
    const h2 = (hash * 2) % 360;
    return `from-[hsl(${h1},70%,50%)] to-[hsl(${h2},70%,50%)]`;
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onView}
    >
      {/* Cover Image or Gradient Background */}
      <div className={`h-32 relative bg-gradient-to-br ${generateGradient(group.name)}`}>
        {group.coverImage && (
          <img 
            src={group.coverImage} 
            alt={group.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Remove the image on error and show the gradient background
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {getInitials(group.name)}
          </span>
        </div>
      </div>

      {/* Group Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-lg">{group.name}</h3>
            <div className="flex items-center text-sm text-gray-500 space-x-2">
              <span className="capitalize">{group.privacy}</span>
              <span>•</span>
              <span>Group</span>
              <span>•</span>
              <span>{formatLastActive(group.lastActive)}</span>
            </div>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              // Add more options menu handler here
            }}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Member Count and Join Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-gray-500">
            <Users size={16} className="mr-1" />
            <span className="text-sm">{group.memberCount} members</span>
          </div>

          {group.isMember ? (
            <span className="text-sm text-gray-600 font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              Member
            </span>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
            >
              {group.privacy === 'private' ? 'Request Access' : 'Join Group'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GroupCard;