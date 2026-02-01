import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const interests = [
  { id: 'tech', label: 'Technology' },
  { id: 'education', label: 'Education' },
  { id: 'creative', label: 'Creative Arts' },
  { id: 'science', label: 'Science' },
  { id: 'business', label: 'Business' },
  { id: 'health', label: 'Health & Wellness' },
];

const roles = [
  { id: 'student', label: 'Student' },
  { id: 'creator', label: 'Creator' },
];

const skillLevels = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'student',
    interests: user?.interests || [],
    skill_level: user?.skill_level || 'beginner',
  });

  const toggleInterest = (interestId) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleSave = async () => {
    if (formData.interests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      role: user?.role || 'student',
      interests: user?.interests || [],
      skill_level: user?.skill_level || 'beginner',
    });
    setEditing(false);
  };

  return (
    <div className="min-h-screen pb-12" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-heading font-bold text-3xl mx-auto mb-4">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
            {user?.name}
          </h1>
          <p className="text-muted">{user?.email}</p>
        </div>

        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Profile Information</h2>
            {!editing ? (
              <Button
                onClick={() => setEditing(true)}
                data-testid="edit-profile-button"
                variant="outline"
                className="rounded-full border-white/60 hover:bg-white/60"
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  data-testid="cancel-edit-button"
                  className="rounded-full border-white/60 hover:bg-white/60"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  data-testid="save-profile-button"
                  className="rounded-full bg-primary text-white hover:shadow-lg hover:shadow-primary/25"
                >
                  <Save size={16} className="mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="profile-name-input"
                  className="bg-white/50 border-white/60 focus:ring-2 focus:ring-primary/20 rounded-xl h-12"
                />
              ) : (
                <div className="text-foreground text-lg">{user?.name}</div>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Role</Label>
              {editing ? (
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger data-testid="profile-role-select" className="bg-white/50 border-white/60 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-2xl border-white/50 rounded-2xl">
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-foreground text-lg capitalize">{user?.role}</div>
              )}
            </div>

            {/* Skill Level */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Skill Level</Label>
              {editing ? (
                <Select
                  value={formData.skill_level}
                  onValueChange={(value) => setFormData({ ...formData, skill_level: value })}
                >
                  <SelectTrigger data-testid="profile-skill-level-select" className="bg-white/50 border-white/60 rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-2xl border-white/50 rounded-2xl">
                    {skillLevels.map(level => (
                      <SelectItem key={level.id} value={level.id}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-foreground text-lg capitalize">{user?.skill_level}</div>
              )}
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label className="text-foreground font-medium">Interests</Label>
              {editing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interests.map((interest) => (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      data-testid={`profile-interest-${interest.id}`}
                      className={cn(
                        'p-3 rounded-xl border-2 transition-all text-sm font-medium',
                        formData.interests.includes(interest.id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-white/60 bg-white/30 text-foreground hover:border-primary/50'
                      )}
                    >
                      {interest.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.length > 0 ? (
                    user.interests.map((interestId) => {
                      const interest = interests.find(i => i.id === interestId);
                      return (
                        <span
                          key={interestId}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {interest?.label || interestId}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted">No interests selected</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};