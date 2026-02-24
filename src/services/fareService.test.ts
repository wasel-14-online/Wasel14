import { describe, it, expect } from 'vitest';
import { fareService } from '../services/fareService';

describe('fareService', () => {
  describe('calculateFare', () => {
    it('should calculate basic fare correctly', () => {
      const result = fareService.calculateFare(10, 20, 'AED', 1);

      expect(result.baseFare).toBe(10);
      expect(result.distanceFare).toBe(20); // 10km * 2 AED/km
      expect(result.timeFare).toBe(10); // 20min * 0.5 AED/min
      expect(result.total).toBe(40);
      expect(result.currency).toBe('AED');
    });

    it('should apply minimum fare', () => {
      const result = fareService.calculateFare(0.5, 1, 'AED', 1);

      expect(result.total).toBe(15); // Minimum fare for AED
    });

    it('should calculate surge pricing', () => {
      const result = fareService.calculateFare(10, 20, 'AED', 1.5);

      expect(result.surgeFare).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(40);
    });
  });

  describe('applyPromoCode', () => {
    it('should apply percentage discount', () => {
      const fare = fareService.calculateFare(10, 20, 'AED', 1);
      const discounted = fareService.applyPromoCode(fare, { type: 'percentage', value: 20 });

      expect(discounted.discount).toBe(8); // 20% of 40
      expect(discounted.total).toBe(32);
    });

    it('should apply fixed discount', () => {
      const fare = fareService.calculateFare(10, 20, 'AED', 1);
      const discounted = fareService.applyPromoCode(fare, { type: 'fixed', value: 10 });

      expect(discounted.discount).toBe(10);
      expect(discounted.total).toBe(30);
    });
  });

  describe('getSurgeMultiplier', () => {
    it('should return 1 for low demand', () => {
      expect(fareService.getSurgeMultiplier(10, 10)).toBe(1);
    });

    it('should return surge multiplier for high demand', () => {
      expect(fareService.getSurgeMultiplier(20, 10)).toBeGreaterThan(1);
    });
  });
});
