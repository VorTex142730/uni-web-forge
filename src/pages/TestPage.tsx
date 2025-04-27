// src/pages/MediaUploadPage.tsx
import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface MediaItem {
  id: string;
  imageData: string;
  caption: string;
  type: 'image';
  createdAt: any;
  userName: string;
  userId: string;
}

const MediaUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null); // For modal preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  
  // Fetch media items on component mount
  useEffect(() => {
    if (!user) return;
    
    const db = getFirestore();
    const mediaRef = collection(db, 'media');
    const mediaQuery = query(mediaRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(mediaQuery, (snapshot) => {
      const items: MediaItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MediaItem);
      });
      setMediaItems(items);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type.startsWith('image/')) {
        if (selectedFile.size > 1000000) {
          setError('Image must be smaller than 1MB');
          setFile(null);
          return;
        }
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select an image file (videos not supported)');
        setFile(null);
      }
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to upload media');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        
        try {
          const db = getFirestore();
          await addDoc(collection(db, 'media'), {
            imageData: base64String,
            caption,
            type: 'image',
            createdAt: serverTimestamp(),
            userName: user.displayName || 'Anonymous',
            userId: user.uid
          });
          
          setFile(null);
          setCaption('');
          setUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          setError('Error saving to database. Please try again.');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Error reading file');
        setUploading(false);
      };
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An error occurred. Please try again.');
      setUploading(false);
    }
  };

  // Open modal with selected image
  const openImageModal = (item: MediaItem) => {
    setSelectedImage(item);
  };

  // Close modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Media Upload</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload New Image</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Image (max 1MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="w-full p-2 border rounded"
                disabled={uploading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add a caption to your image..."
                disabled={uploading}
              />
            </div>
            
            {uploading && (
              <div className="mb-4">
                <div className="text-gray-700 mb-2">Uploading image...</div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full animate-pulse"
                  ></div>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={uploading || !file}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </div>
        
        {/* Preview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          {file ? (
            <div className="border rounded p-4">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="max-h-64 mx-auto rounded"
              />
              {caption && (
                <p className="mt-3 text-gray-700 italic">{caption}</p>
              )}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500 border rounded">
              Select an image to see a preview
            </div>
          )}
        </div>
      </div>
      
      {/* Media Gallery */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Your Image Gallery</h2>
        
        {mediaItems.length === 0 ? (
          <div className="text-center p-8 text-gray-500 border rounded">
            No images uploaded yet. Be the first to share something!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <img 
                  src={item.imageData} 
                  alt={item.caption} 
                  className="w-full h-48 object-cover"
                  onClick={() => openImageModal(item)}
                />
                <div className="p-4">
                  <p className="text-gray-700">{item.caption}</p>
                  <div className="mt-2 text-sm text-gray-500 flex justify-between">
                    <span>{item.userName}</span>
                    <span>
                      {item.createdAt && new Date(item.createdAt.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={closeImageModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <img 
                src={selectedImage.imageData} 
                alt={selectedImage.caption} 
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="p-4">
                <p className="text-gray-700">{selectedImage.caption}</p>
                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>Uploaded by: {selectedImage.userName}</span>
                  <span>
                    {selectedImage.createdAt && new Date(selectedImage.createdAt.toDate()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadPage;