import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Search, UserPlus, Users, Lock, Image as ImageIcon, MessageCircle, UserCheck, CheckCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { getConnections } from '@/lib/firebase/connections';
import { doc as firestoreDoc } from 'firebase/firestore';
import ImageUpload from '@/components/ImageUpload';
import { compressImage } from '@/lib/imageUtils';
import { createNotification } from '@/components/notifications/NotificationService';

interface CreateGroupProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, label: 'Details' },
  { id: 2, label: 'Settings' },
  { id: 3, label: 'Forum' },
  { id: 4, label: 'Photo' },
  { id: 5, label: 'Invites' }
];

const stepIcons = [
  <Users key="users" className="w-5 h-5" />,
  <Lock key="lock" className="w-5 h-5" />,
  <MessageCircle key="forum" className="w-5 h-5" />,
  <ImageIcon key="image" className="w-5 h-5" />,
  <UserCheck key="invite" className="w-5 h-5" />
];

const CreateGroup = ({ onCancel, onSuccess }: CreateGroupProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private',
    photo: '',
    hasForum: false,
    inviteMessage: '',
    selectedMembers: [] as string[],
    permissions: {
      posts: 'all',
      photos: 'all',
      events: 'all',
      messages: 'all'
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [inviteWarning, setInviteWarning] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string; members?: string }>({});

  const handlePhotoUpload = async (base64Image: string) => {
    try {
      // Compress the image
      const compressedImage = await compressImage(base64Image, 400);
      setFormData(prev => ({ ...prev, photo: compressedImage }));
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.error('Failed to process image. Please try a smaller image.');
    }
  };

  useEffect(() => {
    if (currentStep !== 5 || !user) return;
    setConnectionsLoading(true);
    (async () => {
      try {
        const conns = await getConnections(user.uid);
        const userPromises = conns.map(async (conn: any) => {
          const otherUserId = conn.user1 === user.uid ? conn.user2 : conn.user1;
          const userDoc = await getDoc(firestoreDoc(db, 'users', otherUserId));
          return userDoc.exists() ? { id: otherUserId, ...userDoc.data() } : null;
        });
        const users = (await Promise.all(userPromises)).filter(Boolean);
        setConnections(users);
      } catch (e) {
        setConnections([]);
      } finally {
        setConnectionsLoading(false);
      }
    })();
  }, [currentStep, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a group');
      return;
    }
    if (currentStep !== steps.length) {
      return;
    }
    if (formData.selectedMembers.length === 0) {
      setInviteWarning('Please select at least one member to invite.');
      return;
    } else {
      setInviteWarning('');
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
        photo: formData.photo || '/default-group-photo.jpg',
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

      // Send notification to each invited member (except creator)
      for (const memberId of formData.selectedMembers) {
        if (memberId !== user.uid) {
          await createNotification({
            recipientId: memberId,
            senderId: user.uid,
            type: 'group',
            groupId: groupRef.id,
            groupName: formData.name,
            message: `You have been invited to join the group "${formData.name}".`
          });
        }
      }

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
    // Step 1: Require name and description
    if (currentStep === 1) {
      const newErrors: { name?: string; description?: string } = {};
      if (!formData.name.trim()) newErrors.name = 'Group name is required.';
      if (!formData.description.trim()) newErrors.description = 'Description is required.';
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    // Step 5: Require at least one member
    if (currentStep === 5) {
      if (formData.selectedMembers.length === 0) {
        setErrors({ members: 'Please select at least one member to invite.' });
        return;
      }
    }
    setErrors({});
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
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Group Description"
              className={`w-full h-32 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Privacy</h3>
              <RadioGroup
                value={formData.privacy}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, privacy: val as 'public' | 'private' }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
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
            <div className="w-48">
              <ImageUpload
                currentImage={formData.photo}
                onImageUpload={handlePhotoUpload}
                aspectRatio="square"
                className="w-full"
              />
            </div>
          </div>
        );

      case 5:
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
            {connectionsLoading ? (
              <div className="p-4 text-center text-gray-500">Loading connections...</div>
            ) : connections.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No connections found</div>
            ) : (
              <div className="border rounded-lg divide-y">
                {connections
                  .filter((user) => {
                    const name = (user.firstName || '') + ' ' + (user.lastName || '');
                    return name.toLowerCase().includes(searchQuery.toLowerCase()) || (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3"
                    >
                      <span className="text-sm">{user.firstName || ''} {user.lastName || ''} {user.email ? <span className='text-xs text-gray-400'>({user.email})</span> : ''}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            selectedMembers: [...prev.selectedMembers, user.id],
                          }))
                        }
                        disabled={formData.selectedMembers.includes(user.id)}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
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
                  {formData.selectedMembers.map((memberId) => {
                    const user = connections.find((u) => u.id === memberId);
                    if (!user) return null;
                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-sm"
                      >
                        <span>{user.firstName || ''} {user.lastName || ''} {user.email ? <span className='text-xs text-gray-400'>({user.email})</span> : ''}</span>
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              selectedMembers: prev.selectedMembers.filter((m) => m !== memberId),
                            }))
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.members && <div className="text-red-500 text-xs mt-2">{errors.members}</div>}
            {inviteWarning && <div className="text-red-500 text-sm mt-2">{inviteWarning}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 flex items-center gap-2">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <div className={`flex flex-col items-center ${currentStep === step.id ? 'text-blue-600' : 'text-gray-400'}`}> 
                <div className={`rounded-full border-2 ${currentStep === step.id ? 'border-blue-600 bg-white shadow-lg' : 'border-gray-200 bg-gray-100'} w-10 h-10 flex items-center justify-center transition-all duration-200`}>{stepIcons[idx]}</div>
                <span className={`mt-2 text-xs font-semibold ${currentStep === step.id ? 'text-blue-600' : 'text-gray-400'}`}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`flex-1 h-1 ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'} mx-2 rounded transition-all duration-200`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step Content */}
            <div>
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Group Details</h2>
                  <p className="text-gray-500 mb-6">Give your group a name and description.</p>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Settings</h2>
                  <p className="text-gray-500 mb-6">Choose privacy and permissions for your group.</p>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Forum</h2>
                  <p className="text-gray-500 mb-6">Enable a discussion forum for your group.</p>
                </>
              )}
              {currentStep === 4 && (
                <>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Group Photo</h2>
                  <p className="text-gray-500 mb-6">Upload a group photo or logo.</p>
                </>
              )}
              {currentStep === 5 && (
                <>
                  <h2 className="text-xl font-bold mb-2 text-gray-800">Invite Members</h2>
                  <p className="text-gray-500 mb-6">Search and invite people to join your group.</p>
                </>
              )}
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                size="lg"
                className="rounded-full px-6"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                type={currentStep === steps.length ? "submit" : "button"}
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-blue-600 hover:to-purple-600"
                disabled={loading}
                onClick={currentStep === steps.length ? undefined : handleNext}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Creating...</span>
                  </div>
                ) : currentStep === steps.length ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />Create Group
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup; 