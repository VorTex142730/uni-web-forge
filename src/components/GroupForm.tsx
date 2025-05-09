import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

interface GroupFormProps {
  groupId?: string;
  initialData?: {
    name: string;
    description: string;
    photo: string;
    coverPhoto: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const GroupForm: React.FC<GroupFormProps> = ({
  groupId,
  initialData,
  onSuccess,
  onCancel
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [photo, setPhoto] = useState(initialData?.photo || '');
  const [coverPhoto, setCoverPhoto] = useState(initialData?.coverPhoto || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const groupData = {
        name: name.trim(),
        description: description.trim(),
        photo,
        coverPhoto,
        updatedAt: new Date()
      };

      if (groupId) {
        // Update existing group
        await updateDoc(doc(db, 'groups', groupId), groupData);
      } else {
        // Create new group
        const newGroupRef = doc(collection(db, 'groups'));
        await setDoc(newGroupRef, {
          ...groupData,
          createdAt: new Date(),
          memberCount: 1,
          members: [auth.currentUser?.uid]
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Photo
          </label>
          <ImageUpload
            currentImage={coverPhoto}
            onImageUpload={setCoverPhoto}
            aspectRatio="cover"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Photo
          </label>
          <ImageUpload
            currentImage={photo}
            onImageUpload={setPhoto}
            aspectRatio="square"
            className="w-32"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Group Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter group description"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          disabled={isSubmitting || !name.trim()}
        >
          {isSubmitting ? 'Saving...' : groupId ? 'Update Group' : 'Create Group'}
        </Button>
      </div>
    </form>
  );
};

export default GroupForm; 