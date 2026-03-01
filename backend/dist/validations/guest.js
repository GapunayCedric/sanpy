import { z } from 'zod';
const transportationModes = ['private_car', 'bus', 'van', 'motorcycle', 'plane', 'other'];
const purposes = ['leisure', 'business', 'event', 'others'];
// gender limited to male/female for new entries
const genders = ['male', 'female'];
// details for each guest when recording individual demographics
const guestDetail = z.object({
    nationality: z.string().min(2, 'Nationality is required'),
    gender: z.enum(genders),
    ageRange: z.string().min(1, 'Age range is required'),
});
const guestRecordBase = z.object({
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date (YYYY-MM-DD)'),
    // keep simple fields for backwards compatibility but they will be ignored when guests array is provided
    nationality: z.string().min(0),
    gender: z.string().min(0),
    age: z.coerce.number().int().min(0).max(120).optional(),
    transportationMode: z.enum(transportationModes),
    purpose: z.enum(purposes),
    numberOfGuests: z.coerce.number().int().min(1).max(100).optional(),
    // new array of guest details
    guests: z.array(guestDetail).optional(),
    isLocalTourist: z.boolean().optional(),
    festivalRelated: z.boolean().optional(),
});
export const guestRecordSchema = guestRecordBase
    .refine((data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut >= checkIn;
}, { message: 'Check-out must be on or after check-in', path: ['checkOut'] })
    .refine((data) => {
    // require demographic information either via guests array or legacy fields
    if (data.guests && data.guests.length > 0)
        return true;
    return (typeof data.nationality === 'string' && data.nationality.length > 1 &&
        typeof data.gender === 'string' && data.gender.length > 0 &&
        typeof data.age === 'number' && data.age > 0);
}, {
    message: 'Must provide guest demographics (either supply guests array or nationality/gender/age)',
    path: ['guests'],
});
export const guestRecordUpdateSchema = guestRecordBase.partial();
