import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleSendRequest = async () => {
    // Implement the request access functionality here
    console.log('Sending request:', requestMessage);
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const formatLastActive = (date) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/groups')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Groups</span>
      </button>

      <Card className="overflow-hidden bg-white">
        {/* Cover Image */}
        <div 
          className="h-72 w-full relative bg-gradient-to-br from-purple-600 to-blue-600"
          style={{ 
            backgroundImage: group.coverImage ? `url(${group.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Group Info */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">{group.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{group.members?.length || 0} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>Active {formatLastActive(group.lastActive)}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Button 
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Request Access
              </Button>
            </div>
          </div>

          {/* Description */}
          {group.description && (
            <p className="text-gray-600 leading-relaxed">
              {group.description}
            </p>
          )}

          {/* Request Access Form */}
          <div className="border-t pt-6 mt-6">
            <h2 className="text-lg font-medium mb-4">
              Request to Join
            </h2>
            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to join this group (optional)"
              className="min-h-[120px] mb-4 resize-none"
            />
            <Button 
              onClick={handleSendRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Send Request
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GroupDetailsPage; 