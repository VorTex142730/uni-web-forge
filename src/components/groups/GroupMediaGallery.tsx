import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { FeedPost } from '@/services/feedService';
import { Image } from 'lucide-react';

interface GroupMediaGalleryProps {
  groupId: string;
}

const GroupMediaGallery: React.FC<GroupMediaGalleryProps> = ({ groupId }) => {
  const [images, setImages] = useState<Array<{ id: string; imageData: string; postId: string; createdAt: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (!groupId) return;
      
      setLoading(true);
      try {
        // Simplified query to avoid index issues
        const postsQuery = query(
          collection(db, 'groupPosts'),
          where('groupId', '==', groupId)
        );
        
        const querySnapshot = await getDocs(postsQuery);
        const imagesData = querySnapshot.docs
          .map(doc => {
            const data = doc.data() as FeedPost;
            return {
              id: doc.id,
              imageData: data.imageData || '',
              postId: doc.id,
              createdAt: data.createdAt
            };
          })
          .filter(item => item.imageData) // Filter out posts without images
          .sort((a, b) => {
            // Sort by createdAt in descending order (newest first)
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
        
        setImages(imagesData);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [groupId]);

  // Handle ESC key to close the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No images yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          When members share images in the group feed, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(image.imageData)}
          >
            <img 
              src={image.imageData} 
              alt="Group media" 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-full max-h-full p-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors shadow-sm z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedImage}
              className="max-w-full max-h-full object-contain"
              alt="Full screen content"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMediaGallery; 