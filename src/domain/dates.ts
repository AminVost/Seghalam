/** ISO dates are stored as civil calendar dates (not UTC instants). */
export function isValidIsoDay(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const [year,month,date] = day.split('-').map(Number);
  if (!year || !month || !date || year < 1900 || year > 2200) return false;
  const value = new Date(Date.UTC(year, month - 1, date));
  return value.getUTCFullYear() === year && value.getUTCMonth() + 1 === month && value.getUTCDate() === date;
}
export function localIsoDay(now: Date = new Date()): string {
  const p = (num: number) => String(num).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}
export function isExpired(expiresOn: string | undefined, day: string = localIsoDay()): boolean {
  return !!expiresOn && isValidIsoDay(expiresOn) && expiresOn < day;
}
