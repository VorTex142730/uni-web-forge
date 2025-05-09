import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_GROUP_AVATAR = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f465.png'; // 👥 group icon

function isValidPhoto(photo: any) {
  return (
    typeof photo === 'string' &&
    photo.trim().length > 10 &&
    (photo.startsWith('data:image') || photo.startsWith('http'))
  );
}

export const GroupAvatar: React.FC<{ photo?: string; name: string; size?: number }> = ({
  photo,
  name,
  size = 40,
}) => (
  <AnimatePresence>
    {isValidPhoto(photo) ? (
      <motion.img
        key="photo"
        src={photo}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-gray-200 shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      />
    ) : (
      <motion.img
        key="default"
        src={DEFAULT_GROUP_AVATAR}
        alt="default group"
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-gray-200 shadow-sm bg-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      />
    )}
  </AnimatePresence>
); 