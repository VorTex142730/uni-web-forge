import React from 'react';
import { Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface MemberCardProps {
  member: {
    id: string;
    firstName?: string;
    lastName?: string;
    role: string;
    createdAt: string;
    college: string;
    email: string;
    nickname?: string;
    avatar?: string | null;
  };
  isCurrentUser?: boolean;
}

// Role-based badge styling
const roleStyles: Record<string, string> = {
  student: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800',
  instructor: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
};

const MemberCard: React.FC<MemberCardProps> = ({ member, isCurrentUser = false }) => {
  // Generate initials for avatar fallback
  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get role-based styles
  const roleStyle = roleStyles[member.role?.toLowerCase()] || roleStyles.default;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm relative">
      {!isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
              aria-label="Member options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Block</DropdownMenuItem>
            <DropdownMenuItem>Report</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="p-6 text-center">
        <div className="relative mx-auto w-24 h-24 mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={member.avatar ?? undefined}
              alt={`${member.firstName || ''} ${member.lastName || ''}`}
            />
            <AvatarFallback className="text-2xl">
              {getInitials(member.firstName, member.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="mb-2">
          <div
            className={cn('inline-block px-3 py-1 rounded-full text-xs', roleStyle)}
          >
            {member.role || 'Member'}
          </div>
        </div>

        <div className="text-lg font-semibold">{`${member.firstName || ''} ${member.lastName || ''}`}</div>

        <div className="text-sm text-gray-500 mt-1">
          <div>Joined: {new Date(member.createdAt).toLocaleDateString()}</div>
          <div>College: {member.college || 'N/A'}</div>
        </div>
      </div>

      <div className="border-t border-gray-100 p-4">
        {isCurrentUser ? (
          <div className="text-center text-sm text-gray-500">This is you</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full">
              Connect
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