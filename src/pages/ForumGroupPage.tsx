import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, LayoutGrid, List, MoreHorizontal, ChevronRight, Users, Clock, Lock, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Member {
  id: string;
  name: string;
  role: string;
  joinedDate: string;
  lastActive: string;
  avatarUrl?: string;
}

const ForumGroupPage = () => {
  const { groupId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data - replace with actual data fetching
  const groupInfo = {
    id: groupId,
    name: 'Adventure and Thrill',
    type: 'Group',
    privacy: 'Public',
    createdAt: 'Active 6 weeks ago',
    memberCount: 24,
  };

  const members: Member[] = [
    {
      id: '1',
      name: 'Mubina',
      role: 'Student',
      joinedDate: '7 weeks ago',
      lastActive: '5 weeks ago',
    },
    {
      id: '2',
      name: 'John Doe',
      role: 'Moderator',
      joinedDate: '2 months ago',
      lastActive: '1 week ago',
    },
    {
      id: '3',
      name: 'Alice Smith',
      role: 'Student',
      joinedDate: '1 month ago',
      lastActive: '2 days ago',
    },
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/forums" className="hover:text-gray-700">Forums</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">{groupInfo.name}</span>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">{groupInfo.name}</h1>
              {groupInfo.privacy === 'Public' ? (
                <Globe className="h-5 w-5 text-gray-400" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{groupInfo.memberCount} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{groupInfo.createdAt}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm">
              + Join Group
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Group</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete Group</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <div className="bg-white rounded-lg border p-1">
          <TabsList className="w-full grid grid-cols-6 h-9">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="albums">Albums</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-medium text-gray-900">Members</h2>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7",
                      viewMode === 'grid' && "bg-gray-100"
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7",
                      viewMode === 'list' && "bg-gray-100"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={cn(
              "divide-y",
              viewMode === 'grid' && "grid grid-cols-2 gap-4 divide-y-0"
            )}>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "py-4 first:pt-0 last:pb-0",
                    viewMode === 'grid' && "py-4 px-4 border rounded-lg"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-4",
                    viewMode === 'grid' && "flex-col text-center"
                  )}>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "flex-1",
                      viewMode === 'grid' && "flex-none"
                    )}>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mt-1">
                        {member.role}
                      </span>
                      <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                        <p>Joined {member.joinedDate}</p>
                        <p>Active {member.lastActive}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="feed">
          <div className="bg-white rounded-lg border p-6">
            <p className="text-gray-500">No feed items yet.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ForumGroupPage; 