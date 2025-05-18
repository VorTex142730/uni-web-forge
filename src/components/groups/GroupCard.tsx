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
import { motion, AnimatePresence } from 'framer-motion';
import { GroupAvatar } from './GroupAvatar';

interface GroupCardProps {
  group: Group;
  onClick?: () => void;
  variant?: 'mobile' | 'grid' | 'list';
}

const DEFAULT_GROUP_AVATAR = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f465.png'; // 👥 group icon

function pickSticker(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return STICKER_URLS[Math.abs(hash) % STICKER_URLS.length];
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

  // Minimalist meta info
  const metaInfo = `${group.memberCount} member${group.memberCount !== 1 ? 's' : ''} • ${group.privacy} • Active ${formatRelativeTime(group.lastActive)}`;

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/50 flex flex-col hover:scale-[1.02] min-h-[320px] cursor-pointer group"
      onClick={onClick || (() => navigate(`/groups/${group.id}`))}
      whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(80, 63, 205, 0.08)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25, type: 'spring', stiffness: 120 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col items-center pt-6 px-6">
        <div className="relative mb-2">
          <div className="h-20 w-20 rounded-full bg-[#134E4A] p-[2px] shadow-lg flex items-center justify-center mx-auto">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <GroupAvatar photo={group.photo} name={group.name} size={72} />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center truncate w-full">{group.name}</h3>
        {group.description && (
          <p className="text-gray-500 text-sm text-center mt-1 line-clamp-2 w-full">{group.description}</p>
        )}
        <div className="text-xs text-gray-400 mt-2 mb-1 text-center w-full">{metaInfo}</div>
      </div>
      <div className="flex-1" />
      {/* Buttons */}
      {memberStatus === 'creator' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
          className="flex-1 border-gray-300 hover:bg-transparent hover:text-black"
        >
          View
        </Button>
      ) : memberStatus === 'member' ? (
        <Button
          variant="outline"
          size="sm"
          onClick={e => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
          className="flex-1 border-gray-300 hover:bg-transparent hover:text-black"
        >
          View
        </Button>
      ) : memberStatus === 'pending' ? (
        <Button size="sm" disabled className="flex-1 bg-white text-black border border-gray-300">Pending</Button>
      ) : (
        <div className="flex gap-2 p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={e => { e.stopPropagation(); navigate(`/groups/${group.id}`); }}
            className="flex-1 border-gray-300 hover:bg-transparent hover:text-black"
          >
            View
          </Button>
          <Button
            size="sm"
            onClick={e => { e.stopPropagation(); handleJoinGroup(e); }}
            className="flex-1 bg-gradient-to-r from-[#F53855] to-[#FF8A00] text-white hover:opacity-90 border-none"
          >
            {group.privacy === 'private' ? 'Request' : 'Join'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default GroupCard;