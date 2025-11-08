import { z } from 'zod';
import { toE164 } from '@/src/lib/phone';
import { parsePhoneNumber } from 'libphonenumber-js/min';
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
  .min(1, 'Phone number is required')
  .refine((val) => {
    try {
      const p = parsePhoneNumber(val, 'US');
      return p?.isValid() || false;
    } catch {
      return false;
    }
  }, 'Invalid phone number format')
  .transform((val) => {
    const p = parsePhoneNumber(val, 'US');
    return p!.number; // Safe because we validated above
  }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isAdmin: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  eventName: z.string().min(1, 'Event name is required').max(120, 'Event name must be 120 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less'),
  start: z.string().datetime('Invalid start time'),
  end: z.string().datetime('Invalid end time'),
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return start < end;
}, {
  message: 'Start time must be before end time',
  path: ['end'],
}).refine((data) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return start.toDateString() === end.toDateString();
}, {
  message: 'Start and end must be on the same day',
  path: ['end'],
}).refine((data) => {
  const start = new Date(data.start);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of today
  return start >= today;
}, {
  message: 'Cannot book dates in the past',
  path: ['start'],
});

export const roomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
});

export const rejectSchema = z.object({
  comment: z.string().min(1, 'Comment is required for rejection'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type RejectInput = z.infer<typeof rejectSchema>;
