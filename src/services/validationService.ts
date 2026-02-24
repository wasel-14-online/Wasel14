export const validationService = {
  email(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone(phone: string): boolean {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone.replace(/[\s-]/g, ''));
  },

  password(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return { valid: errors.length === 0, errors };
  },

  coordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 1000);
  },

  sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },

  validateTripData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.pickup_location || !this.coordinates(data.pickup_location.lat, data.pickup_location.lng)) {
      errors.push('Invalid pickup location');
    }
    if (!data.dropoff_location || !this.coordinates(data.dropoff_location.lat, data.dropoff_location.lng)) {
      errors.push('Invalid dropoff location');
    }
    if (typeof data.fare !== 'number' || data.fare < 0) {
      errors.push('Invalid fare amount');
    }
    
    return { valid: errors.length === 0, errors };
  }
};
