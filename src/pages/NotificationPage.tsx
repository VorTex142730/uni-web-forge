import { useState } from 'react';
import { Info } from 'lucide-react';

const NotificationsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('unread');
  const [selectedView, setSelectedView] = useState('- View All -');
  
  // Filter options for dropdown
  const viewOptions = ['- View All -', 'Mentions', 'Replies', 'Follows', 'Likes'];
  
  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
          
          <div className="flex items-center">
            <div className="flex border-b">
              <button 
                className={`px-4 py-2 font-medium ${selectedFilter === 'unread' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedFilter('unread')}
              >
                Unread
              </button>
              <button 
                className={`px-4 py-2 font-medium ${selectedFilter === 'read' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                onClick={() => setSelectedFilter('read')}
              >
                Read
              </button>
            </div>
            
            <div className="ml-4">
              <select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700"
              >
                {viewOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 flex items-start">
            <div className="flex-shrink-0 bg-blue-500 rounded-lg p-2 mr-3">
              <Info className="text-white" size={20} />
            </div>
            <p className="text-gray-700">You have no unread notifications.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;