
import { parsePhoneNumber } from 'libphonenumber-js/min';
export function toE164(raw: string, country = 'US') {
  const p = parsePhoneNumber(raw, 'US');
  if (!p?.isValid()) throw new Error('Invalid phone');
  return p.number; // "+15551234567"
}