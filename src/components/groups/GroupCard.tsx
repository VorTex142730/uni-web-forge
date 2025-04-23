// GroupCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const GroupCard = ({ group, onJoin }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    onJoin();
  };

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer bg-white"
      onClick={handleCardClick}
    >
      <div 
        className="h-40 w-full relative"
        style={{ 
          backgroundImage: `url(${group.coverImage})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-lg tracking-tight">{group.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>{group.members?.length || 0}</span>
            <span className="text-gray-400">members</span>
          </div>
          <Button 
            variant="outline" 
            onClick={handleJoinClick}
            className="h-8 px-3 text-sm hover:bg-gray-50"
          >
            Join
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GroupCard;