
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { users } from '@/data/mockData';
import { ChevronRight } from 'lucide-react';

const MembersList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">MEMBERS</h2>
      
      <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="newest">Newest</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        
        {['newest', 'active', 'popular'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <MemberItem key={user.id} user={user} />
            ))}
            
            <div className="text-right">
              <Link 
                to="/members" 
                className="text-hotspot-primary hover:underline inline-flex items-center"
              >
                SEE ALL <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const MemberItem: React.FC<{ user: User }> = ({ user }) => {
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center">
      <Link to={`/profile/${user.id}`} className="relative flex-shrink-0">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.avatar || ''} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        
        {user.status === 'online' && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </Link>
      
      <Link to={`/profile/${user.id}`} className="ml-3 font-medium hover:underline">
        {user.name}
      </Link>
    </div>
  );
};

export default MembersList;
