import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Star,
  Zap,
  Brain,
  BarChart3,
  Settings,
  Crown,
  Sparkles
} from 'lucide-react';
import { AIDynamicPricing } from './AIDynamicPricing';
import { AutoNegotiation } from './AutoNegotiation';
import { DemandPredictionService } from '@/services/demandPredictionService';

interface MarketplaceTrip {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  basePrice: number;
  driver: {
    name: string;
    rating: number;
    trips: number;
  };
  vehicle: {
    type: string;
    seats: number;
  };
  aiInsights: {
    demandLevel: number;
    recommendedPrice: number;
    confidence: number;
    marketPosition: string;
  };
}

interface PremiumMarketplaceProps {
  trips: MarketplaceTrip[];
  userRole: 'passenger' | 'driver';
  onTripSelect: (tripId: string, negotiatedPrice?: number) => void;
  onNegotiationComplete: (tripId: string, finalPrice: number, accepted: boolean) => void;
}

export const PremiumMarketplace: React.FC<PremiumMarketplaceProps> = ({
  trips,
  userRole,
  onTripSelect,
  onNegotiationComplete
}) => {
  const [selectedTrip, setSelectedTrip] = useState<MarketplaceTrip | null>(null);
  const [marketInsights, setMarketInsights] = useState<any>(null);
  const [isPremiumMode, setIsPremiumMode] = useState(true);

  // Initialize demand prediction service
  const demandService = useMemo(() => new DemandPredictionService(), []);

  // Load market insights on mount
  useEffect(() => {
    loadMarketInsights();
  }, []);

  const loadMarketInsights = async () => {
    try {
      // Get demand predictions for the next 24 hours
      const predictions = await demandService.predictMultipleHorizons('dubai', new Date());

      // Analyze patterns
      const patterns = await demandService.analyzeDemandPatterns(
        'dubai',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );

      setMarketInsights({
        predictions,
        patterns
      });
    } catch (error) {
      console.error('Failed to load market insights:', error);
    }
  };

  const getDemandLevelColor = (level: number) => {
    if (level > 80) return 'text-red-600 bg-red-50';
    if (level > 60) return 'text-orange-600 bg-orange-50';
    if (level > 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDemandLevelLabel = (level: number) => {
    if (level > 80) return 'Peak';
    if (level > 60) return 'High';
    if (level > 40) return 'Medium';
    return 'Low';
  };

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'premium': return 'text-purple-600 bg-purple-50';
      case 'high': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-gray-600 bg-gray-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const calculateSavings = (basePrice: number, aiPrice: number) => {
    const savings = basePrice - aiPrice;
    const percentage = (savings / basePrice) * 100;
    return { savings, percentage };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Premium Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Premium Marketplace</h1>
            <p className="text-gray-600">Intelligent pricing, demand prediction, and negotiation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Premium AI
          </Badge>
          <Button
            variant={isPremiumMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPremiumMode(!isPremiumMode)}
          >
            {isPremiumMode ? 'Premium Mode' : 'Standard Mode'}
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      {marketInsights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Demand</p>
                  <p className="text-2xl font-bold">
                    {marketInsights.predictions[0]?.predictedDemand.toFixed(0) || 50}%
                  </p>
                </div>
                <Users className={`h-8 w-8 ${getDemandLevelColor(marketInsights.predictions[0]?.predictedDemand || 50)} p-2 rounded`} />
              </div>
              <Badge className={`mt-2 ${getDemandLevelColor(marketInsights.predictions[0]?.predictedDemand || 50)}`}>
                {getDemandLevelLabel(marketInsights.predictions[0]?.predictedDemand || 50)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                  <p className="text-2xl font-bold">
                    AED {marketInsights.predictions[0]?.factors.competitorPricing.toFixed(1) || '45.0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Market average</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Peak Hours</p>
                  <p className="text-2xl font-bold">
                    {marketInsights.patterns?.peakHours?.slice(0, 2).join(', ') || '8, 17'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Highest demand</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Confidence</p>
                  <p className="text-2xl font-bold">
                    {marketInsights.predictions[0]?.confidence || 75}%
                  </p>
                </div>
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <Progress value={marketInsights.predictions[0]?.confidence || 75} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Marketplace Interface */}
      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trips">Available Trips</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
          <TabsTrigger value="settings">Preferences</TabsTrigger>
        </TabsList>

        {/* Trips Tab */}
        <TabsContent value="trips" className="space-y-4">
          <div className="grid gap-4">
            {trips.map((trip) => {
              const savings = calculateSavings(trip.basePrice, trip.aiInsights.recommendedPrice);

              return (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Trip Details */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {trip.from} → {trip.to}
                            </h3>
                            <p className="text-gray-600">
                              {new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}
                            </p>
                          </div>
                          <Badge className={getDemandLevelColor(trip.aiInsights.demandLevel)}>
                            {getDemandLevelLabel(trip.aiInsights.demandLevel)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {trip.driver.rating} ({trip.driver.trips} trips)
                          </div>
                          <div>{trip.vehicle.type} • {trip.vehicle.seats} seats</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-blue-600">
                            AED {trip.aiInsights.recommendedPrice.toFixed(2)}
                          </div>
                          {savings.savings > 0 && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Save AED {savings.savings.toFixed(2)} ({savings.percentage.toFixed(1)}%)
                            </Badge>
                          )}
                          <Badge className={getMarketPositionColor(trip.aiInsights.marketPosition)}>
                            {trip.aiInsights.marketPosition.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* AI Features */}
                      <div className="space-y-3">
                        {isPremiumMode && (
                          <>
                            <AIDynamicPricing
                              tripId={trip.id}
                              basePrice={trip.basePrice}
                              onPriceUpdate={(price, reason) => {
                                console.log(`Price updated for trip ${trip.id}:`, price, reason);
                              }}
                            />

                            <AutoNegotiation
                              tripId={trip.id}
                              originalPrice={trip.basePrice}
                              userRole={userRole}
                              onNegotiationComplete={(finalPrice, accepted) => {
                                onNegotiationComplete(trip.id, finalPrice, accepted);
                              }}
                            />
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => onTripSelect(trip.id)}
                          className="w-full"
                          size="lg"
                        >
                          {userRole === 'passenger' ? 'Book Trip' : 'Accept Booking'}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setSelectedTrip(trip)}
                          className="w-full"
                        >
                          View Details
                        </Button>

                        {isPremiumMode && (
                          <Badge variant="secondary" className="w-full justify-center">
                            <Zap className="h-3 w-3 mr-1" />
                            AI Optimized
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {marketInsights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demand Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Demand Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketInsights.predictions.slice(0, 4).map((prediction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{prediction.timeHorizon}h ahead</div>
                          <div className="text-sm text-gray-600">
                            Demand: {prediction.predictedDemand.toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            prediction.confidence > 80 ? 'default' :
                            prediction.confidence > 60 ? 'secondary' : 'outline'
                          }>
                            {prediction.confidence}% confident
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {prediction.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Market Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Peak Hours</div>
                      <div className="flex gap-2">
                        {marketInsights.patterns?.peakHours?.map((hour: number) => (
                          <Badge key={hour} variant="outline">{hour}:00</Badge>
                        )) || [8, 17].map(hour => (
                          <Badge key={hour} variant="outline">{hour}:00</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Peak Days</div>
                      <div className="flex gap-2">
                        {marketInsights.patterns?.peakDays?.map((day: number) => (
                          <Badge key={day} variant="outline">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                          </Badge>
                        )) || [5, 6].map(day => (
                          <Badge key={day} variant="outline">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Seasonal Trends</div>
                      <div className="text-sm text-gray-600">
                        Peak demand in Dec-Feb, moderate in Mar-May
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +$185M ARR
                </div>
                <p className="text-sm text-gray-600">
                  Potential annual revenue increase from AI marketplace
                </p>
                <Progress value={75} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  35%
                </div>
                <p className="text-sm text-gray-600">
                  AI-optimized trips conversion vs standard
                </p>
                <Progress value={35} className="mt-3" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  4.8/5
                </div>
                <p className="text-sm text-gray-600">
                  Average rating for AI-negotiated trips
                </p>
                <Progress value={96} className="mt-3" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Marketplace Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Negotiation</div>
                  <div className="text-sm text-gray-600">Allow AI to negotiate prices automatically</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Price Alerts</div>
                  <div className="text-sm text-gray-600">Get notified of optimal pricing opportunities</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Negotiation Limits</div>
                  <div className="text-sm text-gray-600">Set maximum/minimum acceptable prices</div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumMarketplace;