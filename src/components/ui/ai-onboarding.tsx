import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Sparkles, ArrowRight, CheckCircle, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Progress } from './progress';
import { Badge } from './badge';
import { LoadingSpinner } from './loading-spinner';
import { showSuccessToast, showInfoToast } from './toast-notification';
import { cn } from './utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  required?: boolean;
  estimatedTime?: number; // in seconds
  aiSuggestions?: string[];
}

interface AIOnboardingProps {
  steps: OnboardingStep[];
  onComplete: (data: Record<string, any>) => void;
  onSkip?: () => void;
  userPreferences?: Record<string, any>;
  aiContext?: {
    userType?: 'rider' | 'driver' | 'business';
    experience?: 'new' | 'experienced';
    goals?: string[];
  };
  className?: string;
  showProgress?: boolean;
  allowSkip?: boolean;
  autoAdvance?: boolean;
  aiPowered?: boolean;
}

export function AIOnboarding({
  steps,
  onComplete,
  onSkip,
  userPreferences = {},
  aiContext,
  className,
  showProgress = true,
  allowSkip = true,
  autoAdvance = false,
  aiPowered = true,
}: AIOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  // AI-powered suggestions based on context
  const generateAISuggestions = useCallback(async (step: OnboardingStep) => {
    if (!aiPowered || !aiContext) return;

    setIsLoading(true);
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const suggestions = [];

      if (aiContext.userType === 'rider') {
        if (step.id === 'preferences') {
          suggestions.push(
            'Based on your location, we recommend enabling real-time traffic updates',
            'Consider setting up recurring rides for your daily commute',
            'Enable notifications for better trip coordination'
          );
        } else if (step.id === 'payment') {
          suggestions.push(
            'Add multiple payment methods for flexibility',
            'Enable biometric authentication for faster payments',
            'Set up auto-recharge to avoid payment interruptions'
          );
        }
      } else if (aiContext.userType === 'driver') {
        if (step.id === 'vehicle') {
          suggestions.push(
            'Upload high-quality photos of your vehicle for better acceptance',
            'Ensure your insurance is up to date',
            'Consider adding multiple vehicles if available'
          );
        }
      }

      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [aiPowered, aiContext]);

  useEffect(() => {
    if (currentStepData) {
      generateAISuggestions(currentStepData);
    }
  }, [currentStepData, generateAISuggestions]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
      setCurrentStep(prev => prev + 1);
      setShowSuggestions(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowSuggestions(false);
    }
  };

  const handleComplete = () => {
    const finalData = { ...userPreferences, ...stepData };
    onComplete(finalData);
    showSuccessToast('Welcome aboard!', {
      description: 'Your profile has been set up successfully.',
    });
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
      showInfoToast('Onboarding skipped', {
        description: 'You can complete your profile later in settings.',
      });
    }
  };

  const handleStepDataChange = (data: any) => {
    setStepData(prev => ({
      ...prev,
      [currentStepData.id]: data,
    }));
  };

  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
  };

  if (!currentStepData) return null;

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Welcome to Wassel</h1>
        </div>
        {showProgress && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        )}
      </div>

      {/* Current Step Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.title}
                {currentStepData.required && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {currentStepData.description}
                {currentStepData.estimatedTime && (
                  <span className="block text-xs mt-1">
                    Estimated time: {Math.ceil(currentStepData.estimatedTime / 60)} min
                  </span>
                )}
              </CardDescription>
            </div>
            {aiPowered && aiSuggestions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSuggestions}
                className="shrink-0"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Tips
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* AI Suggestions */}
          {showSuggestions && aiSuggestions.length > 0 && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">AI-Powered Suggestions</span>
              </div>
              <ul className="space-y-1">
                {aiSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-6">
            {React.cloneElement(currentStepData.content as React.ReactElement, {
              onChange: handleStepDataChange,
              value: stepData[currentStepData.id],
              userPreferences,
              aiContext,
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {allowSkip && !currentStepData.required && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
              )}
            </div>

            <Button onClick={handleNext} className="min-w-[100px]">
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : isLastStep ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'w-3 h-3 rounded-full transition-colors',
              index < currentStep
                ? 'bg-primary'
                : index === currentStep
                ? 'bg-primary/50'
                : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}

// Predefined onboarding steps for different user types
export const onboardingSteps = {
  rider: [
    {
      id: 'welcome',
      title: 'Welcome to Wassel!',
      description: 'Let\'s get you set up for your first ride.',
      content: (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg">Ready to experience the future of transportation?</p>
        </div>
      ),
    },
    {
      id: 'preferences',
      title: 'Your Preferences',
      description: 'Tell us about your riding preferences to personalize your experience.',
      content: <div>Preferences form content</div>,
      estimatedTime: 120,
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      description: 'Add a payment method to start booking rides.',
      content: <div>Payment setup content</div>,
      required: true,
      estimatedTime: 180,
    },
    {
      id: 'notifications',
      title: 'Stay Connected',
      description: 'Choose how you want to receive updates about your rides.',
      content: <div>Notification preferences content</div>,
      estimatedTime: 60,
    },
  ],

  driver: [
    {
      id: 'welcome',
      title: 'Welcome Driver!',
      description: 'Let\'s get your driver profile set up.',
      content: <div>Welcome content for drivers</div>,
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      description: 'Tell us about your vehicle.',
      content: <div>Vehicle form content</div>,
      required: true,
    },
    {
      id: 'documents',
      title: 'Required Documents',
      description: 'Upload necessary documents to get verified.',
      content: <div>Document upload content</div>,
      required: true,
    },
  ],
};