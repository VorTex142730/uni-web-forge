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
  student: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  instructor: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
};

const MemberCard: React.FC<MemberCardProps> = ({ member, isCurrentUser = false }) => {
  const { user, userDetails } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

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

  return (
    <div
      className={cn(
        'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col',
      )}
    >
      {!isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              aria-label="Member options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Block</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="p-5 text-center flex-grow">
        <div className="relative mx-auto w-20 h-20 mb-3">
          <Avatar className="h-20 w-20 border-2 border-gray-200">
            <AvatarImage
              src={member.photoURL || undefined}
              alt={`${member.firstName || ''} ${member.lastName || ''}'s Profile`}
            />
            <AvatarFallback className="text-xl bg-gray-100 text-gray-500">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-base font-semibold truncate" title={`${member.firstName || ''} ${member.lastName || ''}`}>
          {`${member.firstName || 'Member'} ${member.lastName || ''}`}
        </div>

        {member.role && (
          <div className={cn('inline-block px-3 py-1 rounded-full text-xs', roleStyle)}>
            {member.role}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
          {member.college && <div>{member.college}</div>}
          <div>Joined: {getJoinedDate()}</div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-3">
        {isCurrentUser ? (
          <div className="text-center text-sm text-gray-500">This is you</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="w-full"
              disabled={sendingRequest || connectionStatus !== 'none'}
              onClick={handleConnect}
            >
              {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'pending' ? 'Pending' : 'Connect'}
            </Button>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberCard;