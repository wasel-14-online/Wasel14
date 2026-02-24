export interface FareCalculation {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeFare: number;
  discount: number;
  total: number;
  currency: string;
}

const PRICING = {
  AED: { base: 10, perKm: 2, perMin: 0.5, minimum: 15 },
  SAR: { base: 12, perKm: 2.5, perMin: 0.6, minimum: 18 },
  EGP: { base: 25, perKm: 5, perMin: 1, minimum: 35 },
  USD: { base: 3, perKm: 0.6, perMin: 0.15, minimum: 5 },
  EUR: { base: 2.5, perKm: 0.5, perMin: 0.12, minimum: 4 },
  GBP: { base: 2, perKm: 0.4, perMin: 0.1, minimum: 3.5 }
};

export const fareService = {
  calculateFare(
    distance: number,
    duration: number,
    currency: keyof typeof PRICING = 'AED',
    surgeMultiplier = 1
  ): FareCalculation {
    const pricing = PRICING[currency];
    const baseFare = pricing.base;
    const distanceFare = distance * pricing.perKm;
    const timeFare = duration * pricing.perMin;
    const surgeFare = (baseFare + distanceFare + timeFare) * (surgeMultiplier - 1);
    const subtotal = baseFare + distanceFare + timeFare + surgeFare;
    const total = Math.max(subtotal, pricing.minimum);

    return {
      baseFare,
      distanceFare,
      timeFare,
      surgeFare,
      discount: 0,
      total,
      currency
    };
  },

  applyPromoCode(fare: FareCalculation, promoCode: { type: 'percentage' | 'fixed'; value: number }): FareCalculation {
    const discount = promoCode.type === 'percentage' ? fare.total * (promoCode.value / 100) : promoCode.value;

    return {
      ...fare,
      discount,
      total: Math.max(fare.total - discount, 0)
    };
  },

  getSurgeMultiplier(demand: number, supply: number): number {
    const ratio = demand / supply;
    if (ratio < 1.2) return 1;
    if (ratio < 1.5) return 1.2;
    if (ratio < 2) return 1.5;
    return 2;
  }
};
