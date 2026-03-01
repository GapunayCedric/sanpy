import { z } from 'zod';
export const sendMessageSchema = z.object({
    receiverId: z.coerce.number().int().positive(),
    subject: z.string().min(1, 'Subject is required').max(255),
    message: z.string().min(1, 'Message is required'),
});
