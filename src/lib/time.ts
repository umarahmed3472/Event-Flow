export function toUTC(dateString: string): Date {
  return new Date(dateString);
}

export function fromUTC(date: Date): string {
  return date.toISOString();
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export function isOverlapping(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}
