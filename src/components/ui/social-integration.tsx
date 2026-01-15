import React, { useState } from 'react';
import {
  Share2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Copy,
  Check,
  Users,
  Heart,
  MessageSquare,
  Send
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { showSuccessToast, showErrorToast } from './toast-notification';
import { cn } from './utils';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  onShare?: (platform: string) => void;
  className?: string;
}

export function SocialShare({
  url,
  title,
  description,
  hashtags = [],
  onShare,
  className
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtags.join(',')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleShare = (platform: string) => {
    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      onShare?.(platform);
      showSuccessToast('Shared successfully!', {
        description: `Your ride has been shared on ${platform}.`,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showSuccessToast('Link copied!', {
        description: 'The link has been copied to your clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showErrorToast('Failed to copy', {
        description: 'Please copy the link manually.',
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4 text-blue-600" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4 text-blue-400" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('telegram')}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4 text-blue-500" />
          Telegram
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
      </div>
    </div>
  );
}

interface RideSocialProps {
  rideId: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'joined' | 'interested' | 'declined';
  }>;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: Date;
    likes: number;
  }>;
  onJoinRide?: () => void;
  onLeaveRide?: () => void;
  onComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function RideSocial({
  rideId,
  participants,
  comments,
  onJoinRide,
  onLeaveRide,
  onComment,
  onLikeComment,
  currentUserId,
  className,
}: RideSocialProps) {
  const [newComment, setNewComment] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);

  const joinedCount = participants.filter(p => p.status === 'joined').length;
  const interestedCount = participants.filter(p => p.status === 'interested').length;

  const handleSubmitComment = () => {
    if (newComment.trim() && onComment) {
      onComment(newComment.trim());
      setNewComment('');
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Ride Social
        </CardTitle>
        <CardDescription>
          {joinedCount} joined • {interestedCount} interested
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Participants */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Participants</h4>
          <div className="flex flex-wrap gap-2">
            {participants.slice(0, 6).map((participant) => (
              <div key={participant.id} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback>{participant.name[0]}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{participant.name}</div>
                  <Badge
                    variant={
                      participant.status === 'joined' ? 'default' :
                      participant.status === 'interested' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {participant.status}
                  </Badge>
                </div>
              </div>
            ))}
            {participants.length > 6 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-xs font-medium">
                +{participants.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Comments</h4>

          {/* Comment Input */}
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
              >
                Post
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userAvatar} />
                  <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLikeComment?.(comment.id)}
                      className="h-auto p-0 text-xs"
                    >
                      <Heart className="h-3 w-3 mr-1" />
                      {comment.likes}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
              className="w-full"
            >
              {showAllComments ? 'Show less' : `Show all ${comments.length} comments`}
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="default"
            className="flex-1"
            onClick={onJoinRide}
          >
            Join Ride
          </Button>
          <Button
            variant="outline"
            onClick={onLeaveRide}
          >
            Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface SocialLoginProps {
  providers: Array<{
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
  }>;
  onLogin: (provider: string) => void;
  onError?: (error: string) => void;
  loading?: boolean;
  className?: string;
}

export function SocialLogin({
  providers,
  onLogin,
  onError,
  loading = false,
  className
}: SocialLoginProps) {
  const handleSocialLogin = async (providerId: string) => {
    try {
      await onLogin(providerId);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleSocialLogin(provider.id)}
          disabled={loading}
        >
          <div className="flex items-center gap-3">
            {provider.icon}
            <span>Continue with {provider.name}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}

// Predefined social login providers
export const socialLoginProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>,
    color: '#4285F4',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5 text-blue-600" />,
    color: '#1877F2',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs"></div>,
    color: '#000000',
  },
];
