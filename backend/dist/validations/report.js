import { z } from 'zod';
// Allow empty string from query to become undefined so validation doesn't fail
const optionalNum = (schema) => z.preprocess((val) => (val === '' || val === undefined ? undefined : val), schema.optional());
const optionalStr = (s) => z.preprocess((val) => (val === '' ? undefined : val), s.optional());
export const reportFilterSchema = z.object({
    month: optionalNum(z.coerce.number().int().min(1).max(12)),
    year: optionalNum(z.coerce.number().int().min(2020).max(2100)),
    nationality: optionalStr(z.string()),
    gender: z.preprocess((val) => (val === '' ? undefined : val), z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional()),
    ageMin: optionalNum(z.coerce.number().int().min(0).max(120)),
    ageMax: optionalNum(z.coerce.number().int().min(0).max(120)),
    transportationMode: optionalStr(z.string()),
    businessId: optionalNum(z.coerce.number().int().positive()),
    format: z.enum(['json', 'csv', 'xlsx', 'pdf']).optional(),
});
