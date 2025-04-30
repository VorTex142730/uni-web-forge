import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
    privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
});

const storage = getStorage(app);

// Set CORS configuration
const corsConfig = [
  {
    origin: ['http://localhost:8080'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAgeSeconds: 3600,
    responseHeader: ['Content-Type', 'Access-Control-Allow-Origin'],
  },
];

// Apply CORS configuration
export const setupCors = async () => {
  try {
    await storage.bucket().setCorsConfiguration(corsConfig);
    console.log('CORS configuration updated successfully');
  } catch (error) {
    console.error('Error setting CORS configuration:', error);
  }
}; 