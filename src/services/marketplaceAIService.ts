interface PricingFactors {
  demandLevel: number;
  supplyLevel: number;
  timeOfDay: number;
  dayOfWeek: number;
  weatherImpact: number;
  eventImpact: number;
  competitorPricing: number;
  userHistory: number;
}

interface PricingRecommendation {
  recommendedPrice: number;
  confidence: number;
  reason: string;
  factors: PricingFactors;
  potentialRevenue: number;
  competitorAnalysis: {
    averagePrice: number;
    marketPosition: 'low' | 'medium' | 'high' | 'premium';
  };
}

interface TripData {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  distance: number;
  duration: number;
  driverId: string;
  vehicleType: string;
}

interface MarketData {
  activeTrips: number;
  waitingPassengers: number;
  availableDrivers: number;
  averageWaitTime: number;
  competitorPrices: number[];
  recentBookings: number;
}

export class AIDynamicPricingService {
  private readonly BASE_SURGE_MULTIPLIER = 1.2;
  private readonly MAX_SURGE_MULTIPLIER = 3.0;
  private readonly MIN_DISCOUNT = 0.7;
  private readonly LEARNING_RATE = 0.1;

  // Machine Learning Models (simplified for implementation)
  private demandPredictor = {
    weights: {
      timeOfDay: 0.3,
      dayOfWeek: 0.2,
      weather: 0.15,
      events: 0.15,
      historicalDemand: 0.2
    }
  };

  private priceOptimizer = {
    elasticity: -0.3, // Price elasticity of demand
    competitorFactor: 0.8,
    urgencyFactor: 0.6
  };

  async calculateOptimalPrice(tripId: string, basePrice: number): Promise<PricingRecommendation> {
    try {
      // Gather real-time data (using mock data for now)
      const tripData = await this.getTripData(tripId);
      const marketData = await this.getMarketData(tripData);
      const weatherData = await this.getWeatherImpact(tripData);
      const eventData = await this.getEventImpact(tripData);
      const competitorData = await this.getCompetitorPricing(tripData);

      // Calculate pricing factors
      const factors = await this.calculatePricingFactors(
        tripData,
        marketData,
        weatherData,
        eventData,
        competitorData
      );

      // Apply ML algorithms
      const demandScore = this.predictDemand(factors);
      const optimalMultiplier = this.optimizePriceMultiplier(factors, demandScore);
      const recommendedPrice = Math.round(basePrice * optimalMultiplier * 100) / 100;

      // Calculate confidence and reasoning
      const confidence = this.calculateConfidence(factors, marketData);
      const reason = this.generateReasoning(factors, demandScore, optimalMultiplier);

      // Calculate potential revenue impact
      const potentialRevenue = this.calculateRevenuePotential(
        basePrice,
        recommendedPrice,
        marketData.recentBookings
      );

      // Competitor analysis
      const competitorAnalysis = this.analyzeCompetitorPosition(
        recommendedPrice,
        competitorData
      );

      return {
        recommendedPrice,
        confidence,
        reason,
        factors,
        potentialRevenue,
        competitorAnalysis
      };

    } catch (error) {
      console.error('AI Pricing calculation error:', error);
      // Fallback to base price
      return {
        recommendedPrice: basePrice,
        confidence: 50,
        reason: 'Using base price due to calculation error',
        factors: this.getDefaultFactors(),
        potentialRevenue: 0,
        competitorAnalysis: {
          averagePrice: basePrice,
          marketPosition: 'medium'
        }
      };
    }
  }

  private async getTripData(tripId: string): Promise<TripData> {
    // Mock data for now - in production this would fetch from backend
    return {
      id: tripId,
      from: 'Dubai',
      to: 'Abu Dhabi',
      departureDate: new Date().toISOString().split('T')[0],
      departureTime: '09:00',
      distance: 150, // km
      duration: 90, // minutes
      driverId: 'driver-123',
      vehicleType: 'sedan'
    };
  }

  private async getMarketData(tripData: TripData): Promise<MarketData> {
    // Simulate real-time market data
    return {
      activeTrips: Math.floor(Math.random() * 20) + 5,
      waitingPassengers: Math.floor(Math.random() * 20) + 5,
      availableDrivers: Math.floor(Math.random() * 15) + 3,
      averageWaitTime: Math.floor(Math.random() * 15) + 5,
      competitorPrices: this.generateCompetitorPrices(tripData),
      recentBookings: Math.floor(Math.random() * 50) + 10
    };
  }

  private async getWeatherImpact(tripData: TripData): Promise<number> {
    // Simulate weather API call
    const weatherConditions = ['clear', 'rain', 'storm', 'fog'];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    const weatherImpacts = {
      clear: 0,
      rain: 15, // Increase price due to lower demand
      storm: 30, // Significant increase
      fog: 10   // Moderate increase
    };

    return weatherImpacts[randomWeather as keyof typeof weatherImpacts];
  }

  private async getEventImpact(tripData: TripData): Promise<number> {
    // Check for major events that could affect pricing
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const hour = currentDate.getHours();

    let eventImpact = 0;

    // Weekend surge
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      eventImpact += 20;
    }

    // Peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      eventImpact += 15;
    }

    // Holiday seasons (simplified)
    const month = currentDate.getMonth();
    if (month === 11 || month === 0) { // December/January
      eventImpact += 25;
    }

    return eventImpact;
  }

  private async getCompetitorPricing(tripData: TripData): Promise<number[]> {
    // Generate realistic competitor prices
    const basePrice = tripData.distance * 0.8; // AED per km
    const competitors = 5;

    return Array.from({ length: competitors }, (_, i) => {
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      return Math.round(basePrice * (1 + variation) * 100) / 100;
    });
  }

  private async calculatePricingFactors(
    tripData: TripData,
    marketData: MarketData,
    weatherImpact: number,
    eventImpact: number,
    competitorPrices: number[]
  ): Promise<PricingFactors> {
    const now = new Date();
    const departureTime = new Date(`${tripData.departureDate}T${tripData.departureTime}`);

    // Calculate demand level (0-100)
    const demandLevel = Math.min(100, Math.max(0,
      (marketData.waitingPassengers / marketData.availableDrivers) * 50 +
      (marketData.recentBookings / 10) * 30 +
      (eventImpact / 50) * 20
    ));

    // Calculate supply level (0-100)
    const supplyLevel = Math.min(100, Math.max(0,
      (marketData.availableDrivers / (marketData.waitingPassengers + 1)) * 70 +
      (marketData.activeTrips > 0 ? 30 : 0)
    ));

    // Time factors
    const timeOfDay = departureTime.getHours();
    const dayOfWeek = departureTime.getDay();

    // Competitor analysis
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    const competitorPricing = ((avgCompetitorPrice - (tripData.distance * 0.8)) / (tripData.distance * 0.8)) * 100;

    // User history factor (simplified)
    const userHistory = Math.random() * 20 - 10; // -10% to +10%

    return {
      demandLevel,
      supplyLevel,
      timeOfDay,
      dayOfWeek,
      weatherImpact,
      eventImpact,
      competitorPricing,
      userHistory
    };
  }

  private predictDemand(factors: PricingFactors): number {
    const { weights } = this.demandPredictor;

    // Normalize factors to 0-1 scale
    const normalizedFactors = {
      timeOfDay: factors.timeOfDay / 24,
      dayOfWeek: factors.dayOfWeek / 7,
      weather: Math.max(0, factors.weatherImpact) / 50,
      events: factors.eventImpact / 50,
      historicalDemand: factors.demandLevel / 100
    };

    // Weighted sum prediction
    const prediction = (
      normalizedFactors.timeOfDay * weights.timeOfDay +
      normalizedFactors.dayOfWeek * weights.dayOfWeek +
      normalizedFactors.weather * weights.weather +
      normalizedFactors.events * weights.events +
      normalizedFactors.historicalDemand * weights.historicalDemand
    );

    return Math.min(1, Math.max(0, prediction));
  }

  private optimizePriceMultiplier(factors: PricingFactors, demandScore: number): number {
    const { elasticity, competitorFactor, urgencyFactor } = this.priceOptimizer;

    // Base multiplier from demand
    let multiplier = this.BASE_SURGE_MULTIPLIER + (demandScore * (this.MAX_SURGE_MULTIPLIER - this.BASE_SURGE_MULTIPLIER));

    // Apply elasticity (demand decreases as price increases)
    const elasticityAdjustment = 1 + (elasticity * (multiplier - 1));
    multiplier *= elasticityAdjustment;

    // Competitor adjustment
    const competitorAdjustment = 1 + (factors.competitorPricing / 100) * competitorFactor;
    multiplier *= competitorAdjustment;

    // Urgency factor (higher when supply is low)
    const supplyScarcity = Math.max(0, 1 - factors.supplyLevel / 100);
    multiplier += supplyScarcity * urgencyFactor;

    // Weather and event impacts
    multiplier += (factors.weatherImpact / 100) * 0.5;
    multiplier += (factors.eventImpact / 100) * 0.3;

    // User history adjustment
    multiplier += factors.userHistory / 100;

    // Ensure within bounds
    return Math.min(this.MAX_SURGE_MULTIPLIER, Math.max(this.MIN_DISCOUNT, multiplier));
  }

  private calculateConfidence(factors: PricingFactors, marketData: MarketData): number {
    let confidence = 70; // Base confidence

    // Higher confidence with more market data
    if (marketData.recentBookings > 10) confidence += 10;
    if (marketData.activeTrips > 5) confidence += 5;

    // Lower confidence with extreme factors
    if (factors.weatherImpact > 25) confidence -= 10;
    if (factors.eventImpact > 30) confidence -= 5;

    // Time-based confidence (higher for near-future trips)
    const hoursUntilDeparture = (new Date(factors.timeOfDay * 60 * 60 * 1000).getTime() - Date.now()) / (60 * 60 * 1000);
    if (hoursUntilDeparture < 2) confidence += 10;
    else if (hoursUntilDeparture > 24) confidence -= 10;

    return Math.min(95, Math.max(50, confidence));
  }

  private generateReasoning(factors: PricingFactors, demandScore: number, multiplier: number): string {
    const reasons = [];

    if (demandScore > 0.7) {
      reasons.push('High demand detected');
    } else if (demandScore < 0.3) {
      reasons.push('Low demand period');
    }

    if (factors.supplyLevel < 30) {
      reasons.push('Limited driver availability');
    }

    if (factors.weatherImpact > 15) {
      reasons.push('Weather conditions affecting travel');
    }

    if (factors.eventImpact > 20) {
      reasons.push('Special event or peak time');
    }

    if (factors.competitorPricing > 10) {
      reasons.push('Competitive market positioning');
    }

    const priceChange = multiplier > 1 ? 'increase' : 'decrease';
    const changePercent = Math.abs((multiplier - 1) * 100).toFixed(0);

    return `${reasons.join(', ')}. Recommended ${changePercent}% ${priceChange} for optimal revenue.`;
  }

  private calculateRevenuePotential(
    basePrice: number,
    recommendedPrice: number,
    recentBookings: number
  ): number {
    const priceIncrease = recommendedPrice - basePrice;
    const estimatedDailyBookings = Math.max(1, recentBookings / 30); // Daily average
    const dailyRevenueIncrease = priceIncrease * estimatedDailyBookings;

    return Math.round(dailyRevenueIncrease * 30 * 100) / 100; // Monthly potential
  }

  private analyzeCompetitorPosition(recommendedPrice: number, competitorPrices: number[]): {
    averagePrice: number;
    marketPosition: 'low' | 'medium' | 'high' | 'premium';
  } {
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    const priceRatio = recommendedPrice / avgCompetitorPrice;

    let marketPosition: 'low' | 'medium' | 'high' | 'premium';
    if (priceRatio < 0.9) marketPosition = 'low';
    else if (priceRatio < 1.1) marketPosition = 'medium';
    else if (priceRatio < 1.3) marketPosition = 'high';
    else marketPosition = 'premium';

    return {
      averagePrice: Math.round(avgCompetitorPrice * 100) / 100,
      marketPosition
    };
  }

  private generateCompetitorPrices(tripData: TripData): number[] {
    const basePrice = tripData.distance * 0.8;
    return Array.from({ length: 5 }, () => {
      const variation = (Math.random() - 0.5) * 0.4;
      return Math.round(basePrice * (1 + variation) * 100) / 100;
    });
  }

  private getDefaultFactors(): PricingFactors {
    return {
      demandLevel: 50,
      supplyLevel: 50,
      timeOfDay: 12,
      dayOfWeek: 1,
      weatherImpact: 0,
      eventImpact: 0,
      competitorPricing: 0,
      userHistory: 0
    };
  }

  // Learning methods for continuous improvement
  async updateModelWithFeedback(tripId: string, actualPrice: number, wasAccepted: boolean): Promise<void> {
    // This would update the ML model weights based on real outcomes
    // Implementation would involve storing feedback and retraining models
    console.log(`Updating model for trip ${tripId}: Price ${actualPrice}, Accepted: ${wasAccepted}`);
  }
}

export default AIDynamicPricingService;