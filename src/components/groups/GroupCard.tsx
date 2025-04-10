
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Group, User } from '@/types';
import { cn } from '@/lib/utils';
import { users } from '@/data/mockData';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Find some members for display
  const groupMembers = users.slice(0, 3);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="h-36 bg-gray-200 relative">
        <img 
          src={group.image || '/placeholder.svg'} 
          alt={group.name}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-4 left-4">
          <Avatar className="h-16 w-16 border-4 border-white rounded">
            <AvatarImage src={group.image || ''} alt={group.name} />
            <AvatarFallback className="text-lg">{getInitials(group.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="p-4">
        <Link to={`/groups/${group.id}`} className="text-lg font-semibold hover:text-blue-600">
          {group.name}
        </Link>
        
        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs",
            group.privacy === 'private' ? "bg-gray-100" : "bg-blue-50 text-blue-600"
          )}>
            {group.privacy === 'private' ? 'Private' : 'Public'}
          </span>
          <span>•</span>
          <span>Group</span>
          <span>•</span>
          <span>Active {group.lastActive}</span>
        </div>
        
        <div className="flex items-center mt-4">
          <div className="flex -space-x-2">
            {groupMembers.map((member, index) => (
              <Avatar key={index} className="h-6 w-6 border-2 border-white">
                <AvatarImage src={member.avatar || ''} alt={member.name} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
            
            {group.members > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                +{group.members - 3}
              </div>
            )}
          </div>
          
          <Button 
            variant={group.privacy === 'private' ? "outline" : "default"}
            size="sm"
            className="ml-auto"
          >
            {group.privacy === 'private' ? 'Request Access' : 'Join Group'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
