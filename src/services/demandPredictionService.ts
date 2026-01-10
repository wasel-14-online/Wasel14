interface DemandFactors {
  timeOfDay: number;
  dayOfWeek: number;
  weatherCondition: string;
  temperature: number;
  isHoliday: boolean;
  isWeekend: boolean;
  eventImpact: number;
  historicalDemand: number;
  competitorActivity: number;
  economicIndicators: number;
}

interface DemandPrediction {
  predictedDemand: number; // 0-100 scale
  confidence: number; // 0-100
  timeHorizon: number; // hours ahead
  factors: DemandFactors;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number; // 0-100
  recommendations: string[];
}

interface HistoricalData {
  timestamp: Date;
  demand: number;
  factors: Partial<DemandFactors>;
}

export class DemandPredictionService {
  private readonly PREDICTION_HORIZONS = [1, 6, 12, 24, 72]; // hours
  private readonly CONFIDENCE_THRESHOLDS = {
    high: 80,
    medium: 60,
    low: 40
  };

  // ML Model weights for demand prediction
  private modelWeights = {
    timeOfDay: 0.25,
    dayOfWeek: 0.20,
    weather: 0.15,
    events: 0.15,
    historical: 0.15,
    economic: 0.10
  };

  // Historical data storage (in production, this would be in a database)
  private historicalData: HistoricalData[] = [];

  async predictDemand(
    location: string,
    timestamp: Date = new Date(),
    horizon: number = 24
  ): Promise<DemandPrediction> {
    try {
      // Gather current factors
      const factors = await this.gatherDemandFactors(location, timestamp);

      // Get historical data for the same time patterns
      const historicalPatterns = this.getHistoricalPatterns(factors, timestamp);

      // Apply ML prediction algorithm
      const predictedDemand = this.calculateDemandPrediction(factors, historicalPatterns);

      // Calculate confidence based on data quality and historical accuracy
      const confidence = this.calculatePredictionConfidence(factors, historicalPatterns);

      // Determine trend and volatility
      const trend = this.analyzeTrend(historicalPatterns);
      const volatility = this.calculateVolatility(historicalPatterns);

      // Generate actionable recommendations
      const recommendations = this.generateRecommendations(predictedDemand, factors, trend);

      return {
        predictedDemand,
        confidence,
        timeHorizon: horizon,
        factors,
        trend,
        volatility,
        recommendations
      };

    } catch (error) {
      console.error('Demand prediction error:', error);
      return this.getFallbackPrediction();
    }
  }

  async predictMultipleHorizons(
    location: string,
    baseTimestamp: Date = new Date()
  ): Promise<DemandPrediction[]> {
    const predictions: DemandPrediction[] = [];

    for (const horizon of this.PREDICTION_HORIZONS) {
      const timestamp = new Date(baseTimestamp.getTime() + horizon * 60 * 60 * 1000);
      const prediction = await this.predictDemand(location, timestamp, horizon);
      predictions.push(prediction);
    }

    return predictions;
  }

  async analyzeDemandPatterns(
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    peakHours: number[];
    peakDays: number[];
    seasonalTrends: { [key: string]: number };
    anomalies: { timestamp: Date; demand: number; reason: string }[];
  }> {
    // Analyze historical patterns
    const data = this.historicalData.filter(
      d => d.timestamp >= startDate && d.timestamp <= endDate
    );

    const peakHours = this.findPeakHours(data);
    const peakDays = this.findPeakDays(data);
    const seasonalTrends = this.calculateSeasonalTrends(data);
    const anomalies = this.detectAnomalies(data);

    return {
      peakHours,
      peakDays,
      seasonalTrends,
      anomalies
    };
  }

  private async gatherDemandFactors(location: string, timestamp: Date): Promise<DemandFactors> {
    // Time-based factors
    const timeOfDay = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weather factors (simulated)
    const weatherData = await this.getWeatherData(location, timestamp);
    const { condition, temperature } = weatherData;

    // Holiday and event factors
    const isHoliday = this.isHoliday(timestamp);
    const eventImpact = await this.calculateEventImpact(location, timestamp);

    // Historical demand for similar conditions
    const historicalDemand = this.getHistoricalDemandForSimilarConditions(
      timeOfDay, dayOfWeek, condition, temperature
    );

    // Competitor activity (simulated)
    const competitorActivity = Math.random() * 100;

    // Economic indicators (simplified)
    const economicIndicators = this.getEconomicIndicators(timestamp);

    return {
      timeOfDay,
      dayOfWeek,
      weatherCondition: condition,
      temperature,
      isHoliday,
      isWeekend,
      eventImpact,
      historicalDemand,
      competitorActivity,
      economicIndicators
    };
  }

  private async getWeatherData(location: string, timestamp: Date): Promise<{
    condition: string;
    temperature: number;
  }> {
    // Simulate weather API call
    const conditions = ['clear', 'cloudy', 'rain', 'storm', 'fog'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = 20 + Math.random() * 20; // 20-40°C

    return { condition, temperature };
  }

  private isHoliday(timestamp: Date): boolean {
    const month = timestamp.getMonth();
    const day = timestamp.getDate();

    // Simplified holiday check (would be more comprehensive in production)
    const holidays = [
      { month: 0, day: 1 }, // New Year
      { month: 11, day: 25 }, // Christmas
      { month: 6, day: 15 }, // Eid al-Adha (approximate)
      { month: 4, day: 15 }, // Eid al-Fitr (approximate)
    ];

    return holidays.some(h => h.month === month && h.day === day);
  }

  private async calculateEventImpact(location: string, timestamp: Date): Promise<number> {
    // Simulate event impact calculation
    // In production, this would integrate with event APIs, social media, news, etc.

    let impact = 0;

    // Weekend impact
    if (timestamp.getDay() === 0 || timestamp.getDay() === 6) {
      impact += 25;
    }

    // Peak hours impact
    const hour = timestamp.getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      impact += 20;
    }

    // Random event impact (simulating concerts, sports, etc.)
    if (Math.random() < 0.1) { // 10% chance of major event
      impact += 40;
    }

    return Math.min(100, impact);
  }

  private getHistoricalDemandForSimilarConditions(
    timeOfDay: number,
    dayOfWeek: number,
    weatherCondition: string,
    temperature: number
  ): number {
    // Find similar historical conditions
    const similarConditions = this.historicalData.filter(data => {
      const dataHour = data.timestamp.getHours();
      const dataDay = data.timestamp.getDay();

      return Math.abs(dataHour - timeOfDay) <= 2 &&
             dataDay === dayOfWeek &&
             data.factors?.weatherCondition === weatherCondition;
    });

    if (similarConditions.length === 0) return 50; // Default

    const avgDemand = similarConditions.reduce((sum, data) => sum + data.demand, 0) / similarConditions.length;
    return avgDemand;
  }

  private getEconomicIndicators(timestamp: Date): number {
    // Simplified economic indicators
    // In production, this would integrate with economic data APIs

    const month = timestamp.getMonth();
    const day = timestamp.getDay();

    // Higher demand during business days and certain months
    let indicator = 50;

    if (day >= 1 && day <= 5) indicator += 10; // Business days
    if (month >= 9 && month <= 11) indicator += 15; // Q4 shopping season

    return Math.min(100, Math.max(0, indicator));
  }

  private getHistoricalPatterns(factors: DemandFactors, timestamp: Date): HistoricalData[] {
    // Find historical data with similar patterns
    return this.historicalData.filter(data => {
      const timeDiff = Math.abs(data.timestamp.getTime() - timestamp.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Look for data within 24 hours of similar time patterns
      return hoursDiff <= 24 &&
             data.factors?.dayOfWeek === factors.dayOfWeek &&
             Math.abs((data.factors?.timeOfDay || 0) - factors.timeOfDay) <= 2;
    });
  }

  private calculateDemandPrediction(factors: DemandFactors, historicalData: HistoricalData[]): number {
    // Weighted factor calculation
    const weights = this.modelWeights;

    const normalizedFactors = {
      timeOfDay: factors.timeOfDay / 24,
      dayOfWeek: factors.dayOfWeek / 7,
      weather: this.normalizeWeatherImpact(factors.weatherCondition),
      events: factors.eventImpact / 100,
      historical: factors.historicalDemand / 100,
      economic: factors.economicIndicators / 100
    };

    // Base prediction from current factors
    let prediction = (
      normalizedFactors.timeOfDay * weights.timeOfDay +
      normalizedFactors.dayOfWeek * weights.dayOfWeek +
      normalizedFactors.weather * weights.weather +
      normalizedFactors.events * weights.events +
      normalizedFactors.historical * weights.historical +
      normalizedFactors.economic * weights.economic
    ) * 100;

    // Adjust based on historical patterns
    if (historicalData.length > 0) {
      const historicalAvg = historicalData.reduce((sum, data) => sum + data.demand, 0) / historicalData.length;
      prediction = prediction * 0.7 + historicalAvg * 0.3; // Weighted average
    }

    // Apply weekend/weekday adjustments
    if (factors.isWeekend) {
      prediction *= 1.2; // 20% increase on weekends
    }

    // Holiday adjustments
    if (factors.isHoliday) {
      prediction *= 1.3; // 30% increase on holidays
    }

    return Math.min(100, Math.max(0, prediction));
  }

  private normalizeWeatherImpact(condition: string): number {
    const impacts = {
      clear: 0.5,
      cloudy: 0.4,
      rain: 0.7,
      storm: 0.9,
      fog: 0.6
    };

    return impacts[condition as keyof typeof impacts] || 0.5;
  }

  private calculatePredictionConfidence(factors: DemandFactors, historicalData: HistoricalData[]): number {
    let confidence = 60; // Base confidence

    // Higher confidence with more historical data
    if (historicalData.length > 10) confidence += 20;
    else if (historicalData.length > 5) confidence += 10;

    // Higher confidence for normal conditions
    if (factors.eventImpact < 20) confidence += 10;
    if (factors.weatherCondition === 'clear') confidence += 5;

    // Lower confidence for extreme conditions
    if (factors.eventImpact > 50) confidence -= 15;
    if (factors.weatherCondition === 'storm') confidence -= 10;

    return Math.min(95, Math.max(30, confidence));
  }

  private analyzeTrend(historicalData: HistoricalData[]): 'increasing' | 'decreasing' | 'stable' {
    if (historicalData.length < 3) return 'stable';

    // Simple trend analysis
    const recent = historicalData.slice(-3);
    const older = historicalData.slice(-6, -3);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, data) => sum + data.demand, 0) / recent.length;
    const olderAvg = older.reduce((sum, data) => sum + data.demand, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateVolatility(historicalData: HistoricalData[]): number {
    if (historicalData.length < 2) return 0;

    const demands = historicalData.map(data => data.demand);
    const mean = demands.reduce((sum, demand) => sum + demand, 0) / demands.length;
    const variance = demands.reduce((sum, demand) => sum + Math.pow(demand - mean, 2), 0) / demands.length;

    return Math.min(100, Math.sqrt(variance));
  }

  private generateRecommendations(
    predictedDemand: number,
    factors: DemandFactors,
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    if (predictedDemand > 80) {
      recommendations.push('Increase fleet size by 20-30%');
      recommendations.push('Implement surge pricing immediately');
      recommendations.push('Activate emergency driver recruitment');
    } else if (predictedDemand > 60) {
      recommendations.push('Moderate price increase recommended');
      recommendations.push('Monitor driver availability closely');
    } else if (predictedDemand < 30) {
      recommendations.push('Consider promotional pricing');
      recommendations.push('Optimize fleet allocation');
    }

    if (trend === 'increasing') {
      recommendations.push('Prepare for sustained high demand');
    } else if (trend === 'decreasing') {
      recommendations.push('Implement retention strategies');
    }

    if (factors.weatherCondition === 'rain' || factors.weatherCondition === 'storm') {
      recommendations.push('Increase safety measures for drivers');
      recommendations.push('Prepare for potential cancellations');
    }

    return recommendations;
  }

  private findPeakHours(data: HistoricalData[]): number[] {
    const hourlyDemand: { [hour: number]: number[] } = {};

    data.forEach(d => {
      const hour = d.timestamp.getHours();
      if (!hourlyDemand[hour]) hourlyDemand[hour] = [];
      hourlyDemand[hour].push(d.demand);
    });

    const avgHourlyDemand = Object.entries(hourlyDemand).map(([hour, demands]) => ({
      hour: parseInt(hour),
      avgDemand: demands.reduce((sum, d) => sum + d, 0) / demands.length
    }));

    const sorted = avgHourlyDemand.sort((a, b) => b.avgDemand - a.avgDemand);
    return sorted.slice(0, 3).map(h => h.hour);
  }

  private findPeakDays(data: HistoricalData[]): number[] {
    const dailyDemand: { [day: number]: number[] } = {};

    data.forEach(d => {
      const day = d.timestamp.getDay();
      if (!dailyDemand[day]) dailyDemand[day] = [];
      dailyDemand[day].push(d.demand);
    });

    const avgDailyDemand = Object.entries(dailyDemand).map(([day, demands]) => ({
      day: parseInt(day),
      avgDemand: demands.reduce((sum, d) => sum + d, 0) / demands.length
    }));

    const sorted = avgDailyDemand.sort((a, b) => b.avgDemand - a.avgDemand);
    return sorted.slice(0, 2).map(d => d.day);
  }

  private calculateSeasonalTrends(data: HistoricalData[]): { [key: string]: number } {
    const monthlyDemand: { [month: number]: number[] } = {};

    data.forEach(d => {
      const month = d.timestamp.getMonth();
      if (!monthlyDemand[month]) monthlyDemand[month] = [];
      monthlyDemand[month].push(d.demand);
    });

    const trends: { [key: string]: number } = {};
    Object.entries(monthlyDemand).forEach(([month, demands]) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      trends[monthNames[parseInt(month)]] = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    });

    return trends;
  }

  private detectAnomalies(data: HistoricalData[]): { timestamp: Date; demand: number; reason: string }[] {
    if (data.length < 10) return [];

    const demands = data.map(d => d.demand);
    const mean = demands.reduce((sum, d) => sum + d, 0) / demands.length;
    const stdDev = Math.sqrt(demands.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / demands.length);

    const anomalies: { timestamp: Date; demand: number; reason: string }[] = [];

    data.forEach(d => {
      const zScore = Math.abs(d.demand - mean) / stdDev;
      if (zScore > 2) { // More than 2 standard deviations
        anomalies.push({
          timestamp: d.timestamp,
          demand: d.demand,
          reason: `Unusual demand level (${d.demand}) compared to average (${mean.toFixed(1)})`
        });
      }
    });

    return anomalies;
  }

  private getFallbackPrediction(): DemandPrediction {
    return {
      predictedDemand: 50,
      confidence: 30,
      timeHorizon: 24,
      factors: {
        timeOfDay: 12,
        dayOfWeek: 1,
        weatherCondition: 'clear',
        temperature: 25,
        isHoliday: false,
        isWeekend: false,
        eventImpact: 0,
        historicalDemand: 50,
        competitorActivity: 50,
        economicIndicators: 50
      },
      trend: 'stable',
      volatility: 20,
      recommendations: ['Unable to generate predictions - using fallback values']
    };
  }

  // Method to add historical data for learning
  addHistoricalData(demand: number, factors: Partial<DemandFactors>): void {
    this.historicalData.push({
      timestamp: new Date(),
      demand,
      factors
    });

    // Keep only last 1000 data points to prevent memory issues
    if (this.historicalData.length > 1000) {
      this.historicalData = this.historicalData.slice(-1000);
    }
  }
}

export default DemandPredictionService;