import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Play } from 'lucide-react';

const VideosPage = () => {
  const { user } = useAuth();

  // Mock videos data - in a real app, this would come from your backend
  const videos = [];

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Videos</h1>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </button>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-900" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No videos yet</h3>
            <p className="text-gray-500">Get started by uploading your first video</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPage; 