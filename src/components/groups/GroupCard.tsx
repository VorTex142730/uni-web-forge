// GroupCard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Group } from '@/types';
import { createGroupJoinRequestNotification } from '@/components/notifications/NotificationService';
import { Settings, Users, Lock, Globe, Clock, ChevronRight, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
  variant?: 'mobile' | 'grid' | 'list';
}

const GroupCard = ({ group, onClick, variant = 'grid' }: GroupCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [memberStatus, setMemberStatus] = useState<'creator' | 'member' | 'none' | 'pending'>('none');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMemberStatus = async () => {
      if (!user) return;

      // Check if user is creator
      if (group.createdBy && group.createdBy.userId === user.uid) {
        setMemberStatus('creator');
        return;
      }

      // Check if user is already a member
      const memberQuery = query(
        collection(db, 'groupMembers'),
        where('groupId', '==', group.id),
        where('userId', '==', user.uid)
      );
      const memberDocs = await getDocs(memberQuery);
      
      if (!memberDocs.empty) {
        setMemberStatus('member');
        return;
      }

      // Check if join request is pending
      const requestQuery = query(
        collection(db, 'groupJoinRequests'),
        where('groupId', '==', group.id),
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const requestDocs = await getDocs(requestQuery);
      
      if (!requestDocs.empty) {
        setMemberStatus('pending');
      } else {
        setMemberStatus('none');
      }
    };

    checkMemberStatus();
  }, [user, group.id, group.createdBy]);

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
      if (group.createdBy) {
        await createGroupJoinRequestNotification(
          group.createdBy.userId,
          user.uid,
          user.displayName || 'Anonymous',
          group.id,
          group.name
        );
      }

      setMemberStatus('pending');
      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to send join request');
    }
  };

  const handleViewGroup = () => {
    navigate(`/groups/${group.id}`);
  };

  const handleManageGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/groups/${group.id}?tab=settings`);
  };

  // Format date to relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (variant === 'mobile') {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200" 
        onClick={onClick || handleViewGroup}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center p-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${generateGradient(group.name)}`}>
            <span className="text-white text-sm font-bold">
              {getInitials(group.name)}
            </span>
          </div>
          
          <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-base font-medium text-gray-900 truncate">{group.name}</h3>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span className="mr-2">{group.memberCount}</span>
              <span className={`capitalize ${group.privacy === 'private' ? 'text-orange-500' : 'text-green-500'}`}>
                • {group.privacy}
              </span>
            </div>
            {group.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {group.description}
              </p>
            )}
          </div>

          {memberStatus === 'none' && (
            <Button
              size="sm"
              onClick={handleJoinGroup}
              className="ml-4 flex-shrink-0"
            >
              {group.privacy === 'private' ? 'Request' : 'Join'}
            </Button>
          )}
          {memberStatus === 'pending' && (
            <Button
              size="sm"
              disabled
              className="ml-4 flex-shrink-0"
            >
              Pending
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200" 
        onClick={onClick || handleViewGroup}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center p-4">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${generateGradient(group.name)}`}>
            <span className="text-white text-lg font-bold">
              {getInitials(group.name)}
            </span>
          </div>
          
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
              <Badge variant={group.privacy === 'private' ? 'destructive' : 'default'} className="ml-2">
                {group.privacy === 'private' ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                {group.privacy}
              </Badge>
            </div>
            
            {group.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {group.description}
              </p>
            )}
            
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <Users className="w-4 h-4 mr-1" />
                <span>{group.memberCount} members</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Active {formatRelativeTime(group.lastActive)}</span>
              </div>
            </div>
          </div>

          <div className="ml-4 flex-shrink-0">
            {memberStatus === 'creator' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageGroup}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            ) : memberStatus === 'member' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewGroup();
                }}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                View
              </Button>
            ) : memberStatus === 'pending' ? (
              <Button
                size="sm"
                disabled
              >
                Pending
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleJoinGroup}
              >
                {group.privacy === 'private' ? 'Request' : 'Join'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200" 
      onClick={onClick || handleViewGroup}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className={`h-32 relative flex items-center justify-center ${generateGradient(group.name)}`}>
        <motion.span 
          className="text-white text-3xl font-bold"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {getInitials(group.name)}
        </motion.span>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{group.name}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={group.privacy === 'private' ? 'destructive' : 'default'} className="cursor-help">
                  {group.privacy === 'private' ? <Lock className="h-3 w-3 mr-1" /> : <Globe className="h-3 w-3 mr-1" />}
                  {group.privacy}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{group.privacy === 'private' ? 'Private group - requires approval to join' : 'Public group - anyone can join'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {group.description}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mt-auto mb-4">
          <div className="flex items-center mr-4">
            <Users className="h-4 w-4 mr-1" />
            <span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Active {formatRelativeTime(group.lastActive)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-auto">
          {memberStatus === 'creator' ? (
            <>
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
                onClick={handleManageGroup}
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </>
          ) : memberStatus === 'member' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewGroup();
              }}
              className="w-full"
            >
              View Group
            </Button>
          ) : memberStatus === 'pending' ? (
            <Button
              size="sm"
              disabled
              className="w-full"
            >
              Request Pending
            </Button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GroupCard;