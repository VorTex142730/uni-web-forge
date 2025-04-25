import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Search, UserPlus } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

interface CreateGroupProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Settings' },
  { id: 3, label: 'Forum' },
  { id: 4, label: 'Photo' },
  { id: 5, label: 'Cover Photo' },
  { id: 6, label: 'Invites' }
];

const CreateGroup = ({ onCancel, onSuccess }: CreateGroupProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private',
    photo: null as File | null,
    coverPhoto: null as File | null,
    hasForum: false,
    inviteMessage: '',
    selectedMembers: [] as string[],
    permissions: {
      posts: 'all',
      photos: 'all',
      events: 'all',
      messages: 'all'
    },
    coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'photo') {
          setPhotoPreview(reader.result as string);
        } else {
          setCoverPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a group');
      return;
    }

    setLoading(true);

    try {
      // Create the group document
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: formData.name,
        description: formData.description,
        privacy: formData.privacy,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        memberCount: 1, // Start with 1 member (the creator)
        hasForum: formData.hasForum,
        permissions: formData.permissions,
        photo: photoPreview || '/default-group-photo.jpg',
        coverPhoto: coverPhotoPreview || '/default-group-cover.jpg',
        coverImage: formData.coverImage,
        createdBy: {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL
        }
      });

      // Add creator as owner and member
      await addDoc(collection(db, 'groupMembers'), {
        groupId: groupRef.id,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        role: 'admin',
        joinedAt: serverTimestamp()
      });

      toast.success('Group created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(new Event('submit'));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Group Name"
              className="w-full"
            />
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Group Description"
              className="w-full h-32"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Privacy</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Permissions</h3>
              {Object.keys(formData.permissions).map((permission) => (
                <div key={permission} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{permission}</span>
                  <select
                    value={formData.permissions[permission]}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          [permission]: e.target.value,
                        },
                      }))
                    }
                    className="text-sm border rounded-md p-1"
                  >
                    <option value="all">All Members</option>
                    <option value="moderators">Moderators Only</option>
                    <option value="admin">Admin Only</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasForum}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasForum: e.target.checked }))}
                className="form-checkbox text-blue-600"
              />
              <span className="text-sm">Enable discussion forum</span>
            </label>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div
              className={`relative h-48 w-48 rounded-lg border ${
                photoPreview ? 'border-transparent' : 'border-dashed border-gray-300'
              } hover:border-gray-400 transition-colors`}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Group photo preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Group photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'photo')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div
              className={`relative h-48 w-full rounded-lg border ${
                coverPhotoPreview ? 'border-transparent' : 'border-dashed border-gray-300'
              } hover:border-gray-400 transition-colors`}
            >
              {coverPhotoPreview ? (
                <img
                  src={coverPhotoPreview}
                  alt="Cover photo preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Cover photo</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, 'coverPhoto')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="border rounded-lg divide-y">
              {['John Doe', 'Jane Smith', 'Mike Johnson'].map((member) => (
                <div
                  key={member}
                  className="flex items-center justify-between p-3"
                >
                  <span className="text-sm">{member}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedMembers: [...prev.selectedMembers, member],
                      }))
                    }
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {formData.selectedMembers.length > 0 && (
              <div className="space-y-3">
                <Textarea
                  value={formData.inviteMessage}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, inviteMessage: e.target.value }))
                  }
                  placeholder="Add a personal message to your invites..."
                  className="w-full h-24 text-sm"
                />
                <div className="space-y-2">
                  {formData.selectedMembers.map((member) => (
                    <div
                      key={member}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                    >
                      <span>{member}</span>
                      <button
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selectedMembers: prev.selectedMembers.filter(
                              (m) => m !== member
                            ),
                          }))
                        }
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-sm">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-medium">Create A New Group</h1>
          </div>

          <div className="border-b">
            <div className="flex">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={`py-3 px-4 text-sm ${
                      currentStep === step.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="self-center w-8" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderStepContent()}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  size="sm"
                >
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Creating...</span>
                    </div>
                  ) : currentStep === steps.length ? (
                    'Create Group'
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup; 