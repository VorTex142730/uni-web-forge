// GroupCard.jsx
import React from 'react';
import { Button } from '@/components/ui/button';

const GroupCard = ({ group, onJoin }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-36 bg-gray-200" style={{ backgroundImage: `url(${group.coverImage})`, backgroundSize: 'cover' }}></div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">{group.members.length} members</span>
          <Button variant="outline" onClick={onJoin}>
            Join Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;