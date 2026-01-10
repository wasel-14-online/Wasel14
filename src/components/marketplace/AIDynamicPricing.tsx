import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, Zap } from 'lucide-react';
import { useRealTrips } from '@/hooks/useRealTrips';
import { AIDynamicPricingService } from '@/services/marketplaceAIService';

interface AIDynamicPricingProps {
  tripId: string;
  basePrice: number;
  onPriceUpdate: (newPrice: number, reason: string) => void;
  isActive?: boolean;
}

interface PricingFactors {
  demandLevel: number; // 0-100
  supplyLevel: number; // 0-100
  timeOfDay: number; // 0-24
  dayOfWeek: number; // 0-6
  weatherImpact: number; // -50 to +50
  eventImpact: number; // -50 to +50
  competitorPricing: number; // percentage difference
  userHistory: number; // loyalty discount/premium
}

interface PricingRecommendation {
  recommendedPrice: number;
  confidence: number; // 0-100
  reason: string;
  factors: PricingFactors;
  potentialRevenue: number;
  competitorAnalysis: {
    averagePrice: number;
    marketPosition: 'low' | 'medium' | 'high' | 'premium';
  };
}

export const AIDynamicPricing: React.FC<AIDynamicPricingProps> = ({
  tripId,
  basePrice,
  onPriceUpdate,
  isActive = true
}) => {
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { trips } = useRealTrips();

  // Initialize AI pricing service
  const pricingService = useMemo(() => new AIDynamicPricingService(), []);

  // Calculate dynamic pricing in real-time
  useEffect(() => {
    if (!isActive || !tripId) return;

    const calculatePricing = async () => {
      setIsOptimizing(true);
      try {
        const rec = await pricingService.calculateOptimalPrice(tripId, basePrice);
        setRecommendation(rec);
        setLastUpdate(new Date());

        // Auto-apply high confidence recommendations
        if (rec.confidence > 85) {
          onPriceUpdate(rec.recommendedPrice, rec.reason);
        }
      } catch (error) {
        console.error('AI Pricing calculation failed:', error);
      } finally {
        setIsOptimizing(false);
      }
    };

    calculatePricing();

    // Update pricing every 30 seconds for active trips
    const interval = setInterval(calculatePricing, 30000);
    return () => clearInterval(interval);
  }, [tripId, basePrice, isActive, pricingService, onPriceUpdate]);

  const getPriceChangeIndicator = () => {
    if (!recommendation) return null;

    const change = ((recommendation.recommendedPrice - basePrice) / basePrice) * 100;
    const isIncrease = change > 0;

    return {
      icon: isIncrease ? TrendingUp : TrendingDown,
      color: isIncrease ? 'text-green-600' : 'text-red-600',
      change: Math.abs(change).toFixed(1)
    };
  };

  const getDemandLevel = () => {
    if (!recommendation) return 'unknown';

    const demand = recommendation.factors.demandLevel;
    if (demand > 80) return 'peak';
    if (demand > 60) return 'high';
    if (demand > 40) return 'medium';
    if (demand > 20) return 'low';
    return 'very-low';
  };

  const priceIndicator = getPriceChangeIndicator();
  const demandLevel = getDemandLevel();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Dynamic Pricing
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
            {isOptimizing && (
              <Badge variant="outline" className="animate-pulse">
                Optimizing...
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Pricing Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Base Price</div>
            <div className="text-2xl font-bold">AED {basePrice.toFixed(2)}</div>
          </div>

          {recommendation && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600 flex items-center gap-1">
                AI Recommended
                {priceIndicator && (
                  <priceIndicator.icon className={`h-4 w-4 ${priceIndicator.color}`} />
                )}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                AED {recommendation.recommendedPrice.toFixed(2)}
              </div>
              {priceIndicator && (
                <div className={`text-sm ${priceIndicator.color}`}>
                  {priceIndicator.change}% {recommendation.recommendedPrice > basePrice ? 'increase' : 'decrease'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Confidence & Reasoning */}
        {recommendation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">AI Confidence</span>
              <span className="text-sm text-gray-600">{recommendation.confidence}%</span>
            </div>
            <Progress value={recommendation.confidence} className="h-2" />

            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">AI Reasoning</div>
              <div className="text-sm text-blue-700">{recommendation.reason}</div>
            </div>
          </div>
        )}

        {/* Key Factors */}
        {recommendation && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">
                <Users className="h-4 w-4" />
                Demand Level
              </div>
              <Badge variant={
                demandLevel === 'peak' ? 'destructive' :
                demandLevel === 'high' ? 'default' :
                demandLevel === 'medium' ? 'secondary' : 'outline'
              }>
                {demandLevel.toUpperCase()}
              </Badge>
              <Progress value={recommendation.factors.demandLevel} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Time Factor
              </div>
              <div className="text-sm text-gray-600">
                {recommendation.factors.timeOfDay.toFixed(0)}:00
                {recommendation.factors.weatherImpact !== 0 && (
                  <span className={`ml-2 ${recommendation.factors.weatherImpact > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                    Weather {recommendation.factors.weatherImpact > 0 ? '+' : ''}{recommendation.factors.weatherImpact}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Competitor Analysis */}
        {recommendation && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium mb-2">Market Position</div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">vs Competitors</span>
              <Badge variant={
                recommendation.competitorAnalysis.marketPosition === 'premium' ? 'default' :
                recommendation.competitorAnalysis.marketPosition === 'high' ? 'secondary' : 'outline'
              }>
                {recommendation.competitorAnalysis.marketPosition.toUpperCase()}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Market average: AED {recommendation.competitorAnalysis.averagePrice.toFixed(2)}
            </div>
          </div>
        )}

        {/* Revenue Projection */}
        {recommendation && (
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-900 mb-1">Revenue Projection</div>
            <div className="text-lg font-bold text-green-700">
              +AED {recommendation.potentialRevenue.toFixed(2)} potential
            </div>
            <div className="text-xs text-green-600">
              Based on current demand and conversion rates
            </div>
          </div>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDynamicPricing;