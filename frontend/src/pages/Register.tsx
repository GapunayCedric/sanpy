import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/client';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  businessName: z.string().min(2, 'Required'),
  permitNumber: z.string().min(1, 'Required'),
  ownerName: z.string().min(2, 'Required'),
  contactNumber: z.string().min(8, 'Valid number required'),
  address: z.string().min(5, 'Required'),
  barangay: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [validIdFile, setValidIdFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => v !== undefined && v !== '' && formData.append(k, String(v)));
    if (permitFile) formData.append('permitFile', permitFile);
    if (validIdFile) formData.append('validIdFile', validIdFile);

    try {
      await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gov-blue px-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <p className="text-lg text-gray-800">
            Registration submitted. Your account will be activated after Tourism Office approval.
          </p>
          <p className="mt-2 text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-blue px-4 py-8">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-gov-blue">Request Registration</h1>
        <p className="mt-1 text-sm text-gray-500">Accommodation Business – San Pablo City, Laguna</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {['email', 'password', 'businessName', 'permitNumber', 'ownerName', 'contactNumber', 'address', 'barangay'].map((name) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </label>
              <input
                type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'}
                {...register(name as keyof FormData)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {errors[name as keyof FormData] && (
                <p className="mt-1 text-sm text-red-600">{errors[name as keyof FormData]?.message}</p>
              )}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Permit (PDF/Image)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setPermitFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid ID (PDF/Image)</label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setValidIdFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-gov-blue py-2 text-white hover:bg-gov-light"
          >
            Submit registration
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-gov-blue hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
