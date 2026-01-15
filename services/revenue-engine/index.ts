// Asymmetric Revenue Engine scaffold
export function recordUpsell(userId: string, tripId: string, item: string, amount: number) {
  console.log('recordUpsell', { userId, tripId, item, amount });
}

export default { recordUpsell };
