
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletionProps {
  progress: number;
  details?: {
    complete: boolean;
    label: string;
    progress?: string;
  }[];
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ 
  progress = 0,
  details = [
    { complete: true, label: 'Details', progress: '5/5' },
    { complete: false, label: 'Profile Photo', progress: '0/1' },
    { complete: false, label: 'Cover Photo', progress: '0/1' },
  ]
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">COMPLETE YOUR PROFILE</h2>
      
      <div className="relative mb-6">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold">{progress}</span>
          <span className="text-gray-500 text-sm">%</span>
          <span className="text-gray-500 text-sm">Complete</span>
        </div>
        <Progress
          value={progress}
          className={cn(
            "h-36 w-36 rounded-full bg-gray-100 mx-auto",
            progress < 30 ? "bg-gradient-to-r from-red-500 to-red-300" :
            progress < 70 ? "bg-gradient-to-r from-yellow-500 to-yellow-300" :
            "bg-gradient-to-r from-green-500 to-green-300"
          )}
        />
      </div>
      
      <div className="space-y-3">
        {details.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              {item.complete ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 mr-2" />
              )}
              <span className={item.complete ? "text-gray-900" : "text-gray-500"}>
                {item.label}
              </span>
            </div>
            {item.progress && (
              <span className="text-gray-500 text-sm">{item.progress}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletion;
