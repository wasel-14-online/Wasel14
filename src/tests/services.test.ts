import { describe, it, expect, beforeEach } from 'vitest';
import { fareService } from '../services/fareService';
import { locationService } from '../services/locationService';
import { validationService } from '../services/validationService';
import { stringUtils } from '../utils/stringUtils';
import { dateUtils } from '../utils/dateUtils';

describe('fareService', () => {
  it('calculates basic fare correctly', () => {
    const result = fareService.calculateFare(10, 20, 'AED', 1);
    expect(result.baseFare).toBe(10);
    expect(result.distanceFare).toBe(20);
    expect(result.timeFare).toBe(10);
    expect(result.total).toBe(40);
  });

  it('applies minimum fare', () => {
    const result = fareService.calculateFare(0.5, 1, 'AED', 1);
    expect(result.total).toBe(15);
  });

  it('applies surge pricing', () => {
    const result = fareService.calculateFare(10, 20, 'AED', 1.5);
    expect(result.surgeFare).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(40);
  });

  it('applies percentage discount', () => {
    const fare = fareService.calculateFare(10, 20, 'AED', 1);
    const discounted = fareService.applyPromoCode(fare, { type: 'percentage', value: 20 });
    expect(discounted.discount).toBe(8);
    expect(discounted.total).toBe(32);
  });

  it('applies fixed discount', () => {
    const fare = fareService.calculateFare(10, 20, 'AED', 1);
    const discounted = fareService.applyPromoCode(fare, { type: 'fixed', value: 10 });
    expect(discounted.discount).toBe(10);
    expect(discounted.total).toBe(30);
  });
});

describe('locationService', () => {
  it('calculates distance between two points', () => {
    const loc1 = { lat: 25.2048, lng: 55.2708 };
    const loc2 = { lat: 25.2765, lng: 55.2962 };
    const distance = locationService.calculateDistance(loc1, loc2);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(20);
  });

  it('converts degrees to radians', () => {
    expect(locationService.toRad(180)).toBeCloseTo(Math.PI);
    expect(locationService.toRad(90)).toBeCloseTo(Math.PI / 2);
  });
});

describe('validationService', () => {
  it('validates email correctly', () => {
    expect(validationService.email('test@example.com')).toBe(true);
    expect(validationService.email('invalid-email')).toBe(false);
    expect(validationService.email('test@')).toBe(false);
  });

  it('validates phone correctly', () => {
    expect(validationService.phone('+971501234567')).toBe(true);
    expect(validationService.phone('501234567')).toBe(true);
    expect(validationService.phone('invalid')).toBe(false);
  });

  it('validates password strength', () => {
    const weak = validationService.password('weak');
    expect(weak.valid).toBe(false);
    expect(weak.errors.length).toBeGreaterThan(0);

    const strong = validationService.password('Strong123');
    expect(strong.valid).toBe(true);
    expect(strong.errors.length).toBe(0);
  });

  it('validates coordinates', () => {
    expect(validationService.coordinates(25.2048, 55.2708)).toBe(true);
    expect(validationService.coordinates(91, 55)).toBe(false);
    expect(validationService.coordinates(25, 181)).toBe(false);
  });

  it('sanitizes strings', () => {
    expect(validationService.sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(validationService.sanitizeString('  test  ')).toBe('test');
  });
});

describe('stringUtils', () => {
  it('truncates strings', () => {
    expect(stringUtils.truncate('Hello World', 5)).toBe('Hello...');
    expect(stringUtils.truncate('Hi', 10)).toBe('Hi');
  });

  it('capitalizes strings', () => {
    expect(stringUtils.capitalize('hello')).toBe('Hello');
    expect(stringUtils.capitalize('WORLD')).toBe('World');
  });

  it('slugifies strings', () => {
    expect(stringUtils.slugify('Hello World!')).toBe('hello-world');
    expect(stringUtils.slugify('Test  Multiple   Spaces')).toBe('test-multiple-spaces');
  });

  it('masks email', () => {
    const masked = stringUtils.maskEmail('test@example.com');
    expect(masked).toContain('*');
    expect(masked).toContain('@example.com');
  });

  it('masks phone', () => {
    const masked = stringUtils.maskPhone('1234567890');
    expect(masked).toContain('*');
    expect(masked).toContain('7890');
  });

  it('detects Arabic text', () => {
    expect(stringUtils.isArabic('مرحبا')).toBe(true);
    expect(stringUtils.isArabic('Hello')).toBe(false);
  });
});

describe('dateUtils', () => {
  it('formats dates', () => {
    const date = new Date('2024-01-01');
    const formatted = dateUtils.formatDate(date);
    expect(formatted).toContain('2024');
  });

  it('formats time', () => {
    const date = new Date('2024-01-01T12:30:00');
    const formatted = dateUtils.formatTime(date);
    expect(formatted).toContain('12');
  });

  it('checks if date is today', () => {
    const today = new Date();
    expect(dateUtils.isToday(today)).toBe(true);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(dateUtils.isToday(yesterday)).toBe(false);
  });

  it('checks if date is future', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(dateUtils.isFuture(future)).toBe(true);
    
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(dateUtils.isFuture(past)).toBe(false);
  });

  it('adds days to date', () => {
    const date = new Date('2024-01-01');
    const newDate = dateUtils.addDays(date, 5);
    expect(newDate.getDate()).toBe(6);
  });
});
