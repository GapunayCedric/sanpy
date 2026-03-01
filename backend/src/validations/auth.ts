import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerBusinessSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  permitNumber: z.string().min(1, 'Permit number is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  contactNumber: z.string().min(8, 'Valid contact number required'),
  address: z.string().min(5, 'Address is required'),
  barangay: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const approveRejectSchema = z.object({
  remarks: z.string().optional(),
});

export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBusinessBody = z.infer<typeof registerBusinessSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type ApproveRejectBody = z.infer<typeof approveRejectSchema>;
