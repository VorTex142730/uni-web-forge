import React from 'react';
import { Group } from '@/types';
import GroupCard from './GroupCard';
import { PlaceholderImage } from '../ui/placeholder-image';

interface GroupListProps {
  groups: Group[];
  isLoading?: boolean;
  onGroupClick?: (groupId: string) => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  isLoading = false,
  onGroupClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
          >
            <div className="aspect-[16/9] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <PlaceholderImage
          className="mx-auto mb-4 w-[200px] h-[200px]"
        />
        <h3 className="text-lg font-medium text-gray-900">No Groups Found</h3>
        <p className="mt-2 text-sm text-gray-500">
          There are no groups available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onClick={() => onGroupClick?.(group.id)}
        />
      ))}
    </div>
  );
}; 