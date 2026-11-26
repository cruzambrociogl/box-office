export const price = (cents: number) => (cents === 0 ? 'Free' : `$${(cents / 100).toFixed(2)}`);

export const when = (iso: string) =>
  new Date(iso).toLocaleString('en', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
