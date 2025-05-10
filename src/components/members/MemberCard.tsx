import React, { useEffect, useState } from 'react';
import { Mail, MoreVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { sendConnectionRequest, areUsersConnected, hasPendingRequest } from '@/lib/firebase/connections';
import { createConnectionRequestNotification } from '@/components/notifications/NotificationService';
import { useNavigate } from 'react-router-dom';

interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photoURL?: string;
  username?: string;
  role?: string;
  college?: string;
  nickname?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface MemberCardProps {
  member: Member;
  isCurrentUser?: boolean;
}

const roleStyles: Record<string, string> = {
  student: 'bg-purple-100 text-purple-800',
  admin: 'bg-purple-100 text-purple-800',
  instructor: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
};

const MemberCard: React.FC<MemberCardProps> = ({ member, isCurrentUser = false }) => {
  const { user, userDetails } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const navigate = useNavigate();

  const getInitials = (firstName: string = '', lastName: string = '') => {
    const firstInitial = firstName?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
  };

  const roleStyle = roleStyles[member.role?.toLowerCase() || 'default'] || roleStyles.default;

  useEffect(() => {
    if (!user || isCurrentUser) {
      setConnectionStatus('none');
      return;
    }
    let isMounted = true;
    const checkStatus = async () => {
      setLoadingStatus(true);
      try {
        const connected = await areUsersConnected(user.uid, member.id);
        if (!isMounted) return;
        if (connected) {
          setConnectionStatus('connected');
          setLoadingStatus(false);
          return;
        }
        const pending = await hasPendingRequest(user.uid, member.id);
        if (isMounted) {
          setConnectionStatus(pending ? 'pending' : 'none');
        }
      } catch (error) {
        console.error(`Error checking connection status for member ${member.id}:`, error);
        if (isMounted) setConnectionStatus('none');
      } finally {
        if (isMounted) setLoadingStatus(false);
      }
    };
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [user, member.id, isCurrentUser]);

  const handleConnect = async () => {
    if (!user || !userDetails || connectionStatus !== 'none') return;
    setSendingRequest(true);
    try {
      await sendConnectionRequest(user.uid, member.id);
      if (userDetails?.firstName && userDetails?.lastName) {
        await createConnectionRequestNotification(member.id, user.uid, `${userDetails.firstName} ${userDetails.lastName}`);
      } else {
        await createConnectionRequestNotification(member.id, user.uid, 'A user');
      }
      setConnectionStatus('pending');
    } catch (e: any) {
      console.error('Failed to send connection request:', e);
      alert(e.message || 'Failed to send connection request. Please try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const getJoinedDate = () => {
    try {
      if (!member.createdAt) return 'N/A';
      const date = member.createdAt.toDate ? member.createdAt.toDate() : new Date(member.createdAt);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return 'N/A';
    }
  };

  const handleMessage = () => {
    if (connectionStatus === 'connected') {
      navigate(`/messages?userId=${member.id}`);
    }
  };

  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/50 flex flex-col hover:scale-[1.02]',
      )}
    >
      {!isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute top-2 right-2 p-1.5 text-gray-500 hover:text-gray-700 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
              aria-label="Member options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Block</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="p-6 text-center flex-grow">
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div className="h-24 w-24 rounded-full bg-white shadow-lg border-2 border-purple-100 flex items-center justify-center mx-auto">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={member.photoURL || undefined}
                alt={`${member.firstName || ''} ${member.lastName || ''}'s Profile`}
              />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-gray-600">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="text-lg font-semibold truncate mb-2" title={`${member.firstName || ''} ${member.lastName || ''}`}>
          {`${member.firstName || 'Member'} ${member.lastName || ''}`}
        </div>

        {member.role && (
          <div className={cn('inline-block px-4 py-1.5 rounded-full text-sm font-medium shadow-sm', roleStyle)}>
            {member.role}
          </div>
        )}

        <div className="text-sm text-gray-500 mt-3 space-y-1">
          {member.college && (
            <div className="flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {member.college}
            </div>
          )}
          <div className="flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Joined: {getJoinedDate()}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-200/50">
        {isCurrentUser ? (
          <div className="text-center text-sm text-gray-500">This is you</div>
        ) : (
          <div>
            {connectionStatus === 'connected' ? (
              <Button
                variant="outline"
                className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors duration-200"
                onClick={handleMessage}
              >
                <Mail className="h-4 w-4 mr-2" />
                Message
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors duration-200"
                disabled={sendingRequest || connectionStatus === 'pending'}
                onClick={handleConnect}
              >
                {connectionStatus === 'pending' ? 'Pending' : 'Connect'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;