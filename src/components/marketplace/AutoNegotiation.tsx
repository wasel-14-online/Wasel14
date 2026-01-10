import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  MessageCircle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Brain,
  Handshake
} from 'lucide-react';
import { AIDynamicPricingService } from '@/services/marketplaceAIService';

interface NegotiationOffer {
  id: string;
  price: number;
  timestamp: Date;
  party: 'passenger' | 'driver' | 'system';
  reason: string;
  confidence: number;
  isAccepted?: boolean;
  isCounterOffer?: boolean;
}

interface NegotiationState {
  currentOffer: number;
  originalPrice: number;
  minAcceptable: number;
  maxAcceptable: number;
  offers: NegotiationOffer[];
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  timeRemaining: number; // seconds
  aiSuggestions: string[];
}

interface AutoNegotiationProps {
  tripId: string;
  originalPrice: number;
  userRole: 'passenger' | 'driver';
  onNegotiationComplete: (finalPrice: number, accepted: boolean) => void;
  isActive?: boolean;
}

export const AutoNegotiation: React.FC<AutoNegotiationProps> = ({
  tripId,
  originalPrice,
  userRole,
  onNegotiationComplete,
  isActive = true
}) => {
  const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
  const [userOffer, setUserOffer] = useState<number>(originalPrice);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);

  // Initialize AI negotiation service
  const pricingService = new AIDynamicPricingService();

  // Initialize negotiation when component mounts
  useEffect(() => {
    if (isActive && !negotiation) {
      initializeNegotiation();
    }
  }, [isActive, tripId, originalPrice]);

  // Timer for negotiation expiry
  useEffect(() => {
    if (!negotiation || negotiation.status !== 'active') return;

    const timer = setInterval(() => {
      setNegotiation(prev => {
        if (!prev) return prev;

        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          // Negotiation expired
          onNegotiationComplete(prev.currentOffer, false);
          return { ...prev, status: 'expired', timeRemaining: 0 };
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [negotiation?.status, onNegotiationComplete]);

  const initializeNegotiation = async () => {
    const aiRecommendation = await pricingService.calculateOptimalPrice(tripId, originalPrice);

    // Set negotiation boundaries based on user role and AI analysis
    const flexibility = userRole === 'passenger' ? 0.9 : 1.1; // Passengers want lower, drivers want higher
    const minAcceptable = originalPrice * (flexibility * 0.8);
    const maxAcceptable = originalPrice * (flexibility * 1.2);

    const initialState: NegotiationState = {
      currentOffer: originalPrice,
      originalPrice,
      minAcceptable,
      maxAcceptable,
      offers: [{
        id: 'initial',
        price: originalPrice,
        timestamp: new Date(),
        party: 'system',
        reason: 'Initial price based on route and demand',
        confidence: 100
      }],
      status: 'active',
      timeRemaining: 300, // 5 minutes
      aiSuggestions: generateAISuggestions(aiRecommendation, userRole)
    };

    setNegotiation(initialState);
  };

  const generateAISuggestions = (aiRec: any, role: 'passenger' | 'driver'): string[] => {
    const suggestions: string[] = [];
    const priceDiff = ((aiRec.recommendedPrice - originalPrice) / originalPrice) * 100;

    if (role === 'passenger') {
      if (priceDiff < -10) {
        suggestions.push(`AI suggests offering AED ${aiRec.recommendedPrice.toFixed(2)} (${Math.abs(priceDiff).toFixed(1)}% lower)`);
        suggestions.push('High chance of acceptance based on current demand');
      } else if (priceDiff > 10) {
        suggestions.push('Current market conditions favor higher prices');
        suggestions.push('Consider accepting the current price to secure the ride');
      }
    } else { // driver
      if (priceDiff > 10) {
        suggestions.push(`AI suggests asking AED ${aiRec.recommendedPrice.toFixed(2)} (${priceDiff.toFixed(1)}% higher)`);
        suggestions.push('Strong demand supports higher pricing');
      } else {
        suggestions.push('Market conditions are competitive');
        suggestions.push('Consider slight discount to fill seats quickly');
      }
    }

    return suggestions;
  };

  const makeOffer = async (offerPrice: number) => {
    if (!negotiation || negotiation.status !== 'active') return;

    setIsNegotiating(true);

    try {
      const newOffer: NegotiationOffer = {
        id: Date.now().toString(),
        price: offerPrice,
        timestamp: new Date(),
        party: userRole,
        reason: `Manual offer by ${userRole}`,
        confidence: 80,
        isCounterOffer: negotiation.offers.length > 1
      };

      // Check if offer is within acceptable range
      const isAcceptable = userRole === 'passenger'
        ? offerPrice >= negotiation.minAcceptable
        : offerPrice <= negotiation.maxAcceptable;

      if (isAcceptable && Math.random() < 0.7) { // 70% chance of acceptance if reasonable
        newOffer.isAccepted = true;
        setNegotiation(prev => prev ? {
          ...prev,
          currentOffer: offerPrice,
          offers: [...prev.offers, newOffer],
          status: 'accepted'
        } : null);

        onNegotiationComplete(offerPrice, true);
      } else {
        // Generate counter-offer
        const counterPrice = generateCounterOffer(offerPrice, userRole);
        const counterOffer: NegotiationOffer = {
          id: (Date.now() + 1).toString(),
          price: counterPrice,
          timestamp: new Date(),
          party: userRole === 'passenger' ? 'driver' : 'passenger',
          reason: 'AI-generated counter-offer',
          confidence: 75,
          isCounterOffer: true
        };

        setNegotiation(prev => prev ? {
          ...prev,
          currentOffer: counterPrice,
          offers: [...prev.offers, newOffer, counterOffer]
        } : null);
      }
    } catch (error) {
      console.error('Negotiation error:', error);
    } finally {
      setIsNegotiating(false);
    }
  };

  const generateCounterOffer = (offerPrice: number, userRole: 'passenger' | 'driver'): number => {
    if (!negotiation) return offerPrice;

    const midpoint = (negotiation.minAcceptable + negotiation.maxAcceptable) / 2;
    const adjustment = userRole === 'passenger' ? 1.05 : 0.95; // Slight increase/decrease

    let counterPrice = offerPrice * adjustment;

    // Ensure within bounds
    counterPrice = Math.max(negotiation.minAcceptable, Math.min(negotiation.maxAcceptable, counterPrice));

    return Math.round(counterPrice * 100) / 100;
  };

  const acceptCurrentOffer = () => {
    if (!negotiation) return;
    onNegotiationComplete(negotiation.currentOffer, true);
    setNegotiation(prev => prev ? { ...prev, status: 'accepted' } : null);
  };

  const rejectNegotiation = () => {
    if (!negotiation) return;
    onNegotiationComplete(negotiation.currentOffer, false);
    setNegotiation(prev => prev ? { ...prev, status: 'rejected' } : null);
  };

  const getNegotiationStatusColor = () => {
    if (!negotiation) return 'gray';

    switch (negotiation.status) {
      case 'accepted': return 'green';
      case 'rejected': return 'red';
      case 'expired': return 'orange';
      default: return 'blue';
    }
  };

  const getNegotiationStatusIcon = () => {
    if (!negotiation) return Clock;

    switch (negotiation.status) {
      case 'accepted': return CheckCircle;
      case 'rejected': return XCircle;
      case 'expired': return Clock;
      default: return MessageCircle;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!negotiation) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2" />
            Initializing AI Negotiation...
          </div>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = getNegotiationStatusIcon();
  const statusColor = getNegotiationStatusColor();

  return (
    <Dialog open={showNegotiation} onOpenChange={setShowNegotiation}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full ${statusColor === 'green' ? 'border-green-500 text-green-700' :
                           statusColor === 'red' ? 'border-red-500 text-red-700' :
                           statusColor === 'orange' ? 'border-orange-500 text-orange-700' :
                           'border-blue-500 text-blue-700'}`}
          disabled={!isActive}
        >
          <Handshake className="h-4 w-4 mr-2" />
          Negotiate Price
          <StatusIcon className={`h-4 w-4 ml-2 ${statusColor === 'green' ? 'text-green-600' :
                                                statusColor === 'red' ? 'text-red-600' :
                                                statusColor === 'orange' ? 'text-orange-600' :
                                                'text-blue-600'}`} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Price Negotiation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Negotiation Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${statusColor === 'green' ? 'text-green-600' :
                                              statusColor === 'red' ? 'text-red-600' :
                                              statusColor === 'orange' ? 'text-orange-600' :
                                              'text-blue-600'}`} />
              <span className="font-medium capitalize">{negotiation.status} Negotiation</span>
            </div>

            {negotiation.status === 'active' && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(negotiation.timeRemaining)}</span>
              </div>
            )}
          </div>

          {/* Current Price Display */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Offer</div>
            <div className="text-3xl font-bold text-blue-600">
              AED {negotiation.currentOffer.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {((negotiation.currentOffer - negotiation.originalPrice) / negotiation.originalPrice * 100).toFixed(1)}%
              from original
            </div>
          </div>

          {/* AI Suggestions */}
          {negotiation.aiSuggestions.length > 0 && negotiation.status === 'active' && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-blue-900">AI Recommendations</div>
              {negotiation.aiSuggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">{suggestion}</div>
                </div>
              ))}
            </div>
          )}

          {/* Offer History */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Negotiation History</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {negotiation.offers.map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {offer.party === 'passenger' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {offer.party === 'driver' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {offer.party === 'system' && <Brain className="h-4 w-4 text-blue-500" />}
                    <span className="text-sm capitalize">{offer.party}</span>
                    {offer.isCounterOffer && <Badge variant="outline" className="text-xs">Counter</Badge>}
                  </div>
                  <div className="text-right">
                    <div className="font-medium">AED {offer.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">
                      {offer.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiation Controls */}
          {negotiation.status === 'active' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Offer (AED)</label>
                  <Input
                    type="number"
                    value={userOffer}
                    onChange={(e) => setUserOffer(parseFloat(e.target.value) || 0)}
                    min={negotiation.minAcceptable}
                    max={negotiation.maxAcceptable}
                    step="0.50"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => makeOffer(userOffer)}
                    disabled={isNegotiating || userOffer === negotiation.currentOffer}
                    className="w-full"
                  >
                    {isNegotiating ? 'Processing...' : 'Make Offer'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={acceptCurrentOffer}
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Offer
                </Button>
                <Button
                  onClick={rejectNegotiation}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  End Negotiation
                </Button>
              </div>
            </div>
          )}

          {/* Final Status */}
          {negotiation.status !== 'active' && (
            <div className={`p-4 rounded-lg text-center ${
              negotiation.status === 'accepted' ? 'bg-green-50 text-green-800' :
              negotiation.status === 'rejected' ? 'bg-red-50 text-red-800' :
              'bg-orange-50 text-orange-800'
            }`}>
              <StatusIcon className="h-8 w-8 mx-auto mb-2" />
              <div className="font-medium capitalize">
                Negotiation {negotiation.status}
              </div>
              <div className="text-sm mt-1">
                Final price: AED {negotiation.currentOffer.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoNegotiation;