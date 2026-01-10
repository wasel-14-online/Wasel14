import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Brain, ChevronLeft, ChevronRight, CheckCircle, Star, Target, Zap, Users, TrendingUp, Share2, Bell, Trophy, Flame } from 'lucide-react';
import { mentalModels, MentalModel } from '../data/mentalModels';

const availableBadges: Badge[] = [
  { id: 'first-day', title: 'First Step', description: 'Completed your first day', icon: '🌟', unlocked: false },
  { id: 'week-warrior', title: 'Week Warrior', description: 'Completed 7 days', icon: '⚔️', unlocked: false },
  { id: 'streak-3', title: 'Consistency', description: '3-day streak', icon: '🔥', unlocked: false },
  { id: 'streak-7', title: 'Fire Starter', description: '7-day streak', icon: '🔥🔥', unlocked: false },
  { id: 'streak-14', title: 'Blaze', description: '14-day streak', icon: '🔥🔥🔥', unlocked: false },
  { id: 'streak-30', title: 'Inferno', description: '30-day streak', icon: '🌋', unlocked: false },
  { id: 'reflector', title: 'Deep Thinker', description: 'Wrote 10 reflections', icon: '🧠', unlocked: false },
  { id: 'master', title: 'Billionaire Mind', description: 'Completed all 30 days', icon: '💎', unlocked: false },
];

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface ThinkingCoachProgress {
  completedDays: number[];
  reflections: { [day: number]: string };
  startDate: string;
  streak: number;
  lastCompletionDate: string;
  badges: string[];
  goals: string[];
  notificationsEnabled: boolean;
}

const STORAGE_KEY = 'thinking-coach-progress';

export function ThinkingCoach() {
  const [currentDay, setCurrentDay] = useState(1);
  const [progress, setProgress] = useState<ThinkingCoachProgress>({
    completedDays: [],
    reflections: {},
    startDate: new Date().toISOString().split('T')[0],
    streak: 0,
    lastCompletionDate: '',
    badges: [],
    goals: [],
    notificationsEnabled: false
  });
  const [reflection, setReflection] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Load progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Recalculate streak on load
      const currentStreak = calculateStreak(parsed.completedDays, parsed.lastCompletionDate);
      const updatedProgress = { ...parsed, streak: currentStreak };
      setProgress(updatedProgress);
      // Set current day to the next incomplete day or last completed +1
      const lastCompleted = Math.max(...parsed.completedDays, 0);
      setCurrentDay(lastCompleted + 1 > 30 ? 30 : lastCompleted + 1);
    }
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: ThinkingCoachProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  };

  // Calculate streak
  const calculateStreak = (completedDays: number[], lastDate: string): number => {
    if (!lastDate) return 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastDate === today || lastDate === yesterday) {
      // Count consecutive from lastDate backwards
      let streak = 1;
      let currentDate = new Date(lastDate);
      while (true) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayNumber = Math.floor((new Date(dateStr).getTime() - new Date(progress.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (completedDays.includes(dayNumber)) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    }
    return 0;
  };

  // Check and unlock badges
  const checkBadges = (newProgress: ThinkingCoachProgress): string[] => {
    const badges = [...newProgress.badges];
    const completedCount = newProgress.completedDays.length;
    const reflectionCount = Object.keys(newProgress.reflections).length;
    const streak = newProgress.streak;

    if (completedCount >= 1 && !badges.includes('first-day')) badges.push('first-day');
    if (completedCount >= 7 && !badges.includes('week-warrior')) badges.push('week-warrior');
    if (streak >= 3 && !badges.includes('streak-3')) badges.push('streak-3');
    if (streak >= 7 && !badges.includes('streak-7')) badges.push('streak-7');
    if (streak >= 14 && !badges.includes('streak-14')) badges.push('streak-14');
    if (streak >= 30 && !badges.includes('streak-30')) badges.push('streak-30');
    if (reflectionCount >= 10 && !badges.includes('reflector')) badges.push('reflector');
    if (completedCount >= 30 && !badges.includes('master')) badges.push('master');

    return badges;
  };

  const currentModel = mentalModels.find(m => m.day === currentDay) || mentalModels[0];
  const isCompleted = progress.completedDays.includes(currentDay);
  const progressPercentage = (progress.completedDays.length / 30) * 100;

  const handleMarkComplete = () => {
    if (!isCompleted) {
      const today = new Date().toISOString().split('T')[0];
      const newCompletedDays = [...progress.completedDays, currentDay].sort((a, b) => a - b);
      const newStreak = calculateStreak(newCompletedDays, today);
      const newProgress = {
        ...progress,
        completedDays: newCompletedDays,
        lastCompletionDate: today,
        streak: newStreak,
        badges: checkBadges({ ...progress, completedDays: newCompletedDays, streak: newStreak })
      };
      saveProgress(newProgress);
    }
  };

  const handleSaveReflection = () => {
    const newProgress = {
      ...progress,
      reflections: { ...progress.reflections, [currentDay]: reflection }
    };
    saveProgress(newProgress);
    setReflection('');
  };

  const getInspirationIcon = (inspiration: string) => {
    const icons: { [key: string]: any } = {
      'Elon Musk': Zap,
      'Jeff Bezos': TrendingUp,
      'Naval Ravikant': Brain,
      'Charlie Munger': Target,
      'Peter Thiel': Users,
      'Warren Buffett': Star,
      'Ray Dalio': TrendingUp,
      'Howard Marks': Target,
      'Eric Ries': Zap,
      'Weekly Review': CheckCircle,
      'Integration': Brain,
      'Habit Formation': Star
    };
    return icons[inspiration] || Brain;
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDay = direction === 'next' ? currentDay + 1 : currentDay - 1;
    if (newDay >= 1 && newDay <= 30) {
      setCurrentDay(newDay);
      setReflection(progress.reflections[newDay] || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Billionaire Thinking Coach</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Reprogram your mind with daily mental models from the world's greatest thinkers.
          Transform from average to billionaire-level thinking.
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Progress
          </CardTitle>
          <CardDescription>
            {progress.completedDays.length} of 30 days completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Streak: {progress.streak} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Badges: {progress.badges.length}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
              <div
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  progress.completedDays.includes(day)
                    ? 'bg-primary text-primary-foreground'
                    : day === currentDay
                    ? 'bg-secondary text-secondary-foreground border-2 border-primary'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges by completing challenges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBadges.map(badge => {
              const unlocked = progress.badges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border text-center ${
                    unlocked ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <h4 className={`font-semibold ${unlocked ? 'text-primary' : 'text-gray-500'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Day Model */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Day {currentDay}
              </Badge>
              <Badge variant="secondary">
                Week {currentModel.week}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDay('prev')}
                disabled={currentDay === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDay('next')}
                disabled={currentDay === 30}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-2xl">{currentModel.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            {(() => {
              const Icon = getInspirationIcon(currentModel.inspiration);
              return <Icon className="w-4 h-4" />;
            })()}
            Inspired by {currentModel.inspiration}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{currentModel.description}</p>

          {/* Completion Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Completed</span>
                </>
              ) : (
                <span className="text-muted-foreground">Not completed yet</span>
              )}
            </div>
            {!isCompleted && (
              <Button onClick={handleMarkComplete} className="bg-primary hover:bg-primary/90">
                Mark as Complete
              </Button>
            )}
          </div>

          {/* Reflection */}
          <div className="space-y-3">
            <h3 className="font-semibold">Your Reflection</h3>
            <Textarea
              placeholder="How does this mental model apply to your life? What insights did you gain?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleSaveReflection}
              variant="outline"
              disabled={!reflection.trim()}
            >
              Save Reflection
            </Button>
            {progress.reflections[currentDay] && (
              <p className="text-sm text-muted-foreground">
                Last saved: {new Date().toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Spend 10 minutes each morning reviewing the daily model</li>
            <li>• Apply the model to at least one decision today</li>
            <li>• Journal your insights and how your thinking is changing</li>
            <li>• Share your progress with an accountability partner</li>
            <li>• Review completed models weekly to reinforce learning</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}