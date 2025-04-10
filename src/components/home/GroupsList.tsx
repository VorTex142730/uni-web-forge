
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Group } from '@/types';
import { groups } from '@/data/mockData';

const GroupsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('popular');
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">GROUPS</h2>
      
      <Tabs defaultValue="popular" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        {['newest', 'active', 'popular'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {groups.slice(0, 3).map((group) => (
              <GroupItem key={group.id} group={group} />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const GroupItem: React.FC<{ group: Group }> = ({ group }) => {
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center mb-4">
      <Link to={`/groups/${group.id}`} className="flex-shrink-0">
        <Avatar className="h-12 w-12 rounded">
          <AvatarImage src={group.image} alt={group.name} />
          <AvatarFallback>{getInitials(group.name)}</AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="ml-3 flex-grow">
        <Link to={`/groups/${group.id}`} className="font-medium hover:text-blue-600">
          {group.name}
        </Link>
        <p className="text-sm text-gray-500">{group.members} members</p>
      </div>
    </div>
  );
};

export default GroupsList;
