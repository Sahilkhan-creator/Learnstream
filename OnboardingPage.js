import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const interests = [
  { id: 'tech', label: 'Technology', emoji: '💻' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'creative', label: 'Creative Arts', emoji: '🎨' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'health', label: 'Health & Wellness', emoji: '🏃' },
];

const roles = [
  { id: 'student', label: 'Student', description: 'I want to learn new skills' },
  { id: 'creator', label: 'Creator', description: 'I want to share my knowledge' },
];

const skillLevels = [
  { id: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { id: 'advanced', label: 'Advanced', description: 'Expert level' },
];

export const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedRole, setSelectedRole] = useState('student');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interestId) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        interests: selectedInterests,
        role: selectedRole,
        skill_level: selectedSkillLevel,
        onboarded: true,
      });
      toast.success('Profile setup complete!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #DBEAFE 100%)' }}>
      <GlassCard className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-foreground mb-2">Personalize Your Experience</h1>
          <p className="text-muted">Help us tailor content just for you</p>
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1.5 w-16 rounded-full transition-all',
                  s <= step ? 'bg-primary' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Interests */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">What interests you?</h2>
              <p className="text-muted text-sm">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  data-testid={`interest-${interest.id}`}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all text-left',
                    selectedInterests.includes(interest.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-white/60 bg-white/30 hover:border-primary/50'
                  )}
                >
                  <div className="text-3xl mb-2">{interest.emoji}</div>
                  <div className="font-medium text-foreground">{interest.label}</div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={selectedInterests.length === 0}
              data-testid="onboarding-next-step-1"
              className="w-full bg-primary text-white rounded-full h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Role */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">What's your role?</h2>
              <p className="text-muted text-sm">Choose one</p>
            </div>

            <div className="space-y-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  data-testid={`role-${role.id}`}
                  className={cn(
                    'w-full p-6 rounded-2xl border-2 transition-all text-left',
                    selectedRole === role.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/60 bg-white/30 hover:border-primary/50'
                  )}
                >
                  <div className="font-heading text-xl font-semibold text-foreground mb-1">{role.label}</div>
                  <div className="text-muted text-sm">{role.description}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                data-testid="onboarding-back-step-2"
                className="flex-1 rounded-full h-12 font-medium border-white/60 hover:bg-white/60"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                data-testid="onboarding-next-step-2"
                className="flex-1 bg-primary text-white rounded-full h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Skill Level */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">What's your skill level?</h2>
              <p className="text-muted text-sm">This helps us recommend appropriate content</p>
            </div>

            <div className="space-y-4">
              {skillLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedSkillLevel(level.id)}
                  data-testid={`skill-level-${level.id}`}
                  className={cn(
                    'w-full p-6 rounded-2xl border-2 transition-all text-left',
                    selectedSkillLevel === level.id
                      ? 'border-primary bg-primary/10'
                      : 'border-white/60 bg-white/30 hover:border-primary/50'
                  )}
                >
                  <div className="font-heading text-xl font-semibold text-foreground mb-1">{level.label}</div>
                  <div className="text-muted text-sm">{level.description}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                data-testid="onboarding-back-step-3"
                className="flex-1 rounded-full h-12 font-medium border-white/60 hover:bg-white/60"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                data-testid="onboarding-complete"
                className="flex-1 bg-primary text-white rounded-full h-12 font-medium hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};