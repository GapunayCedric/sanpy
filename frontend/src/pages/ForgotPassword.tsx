import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../api/client';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch {
      setError('Request failed. Try again.');
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gov-blue px-4">
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <p className="text-gray-800">If the email exists, a reset link has been sent.</p>
          <Link to="/login" className="mt-4 inline-block text-gov-blue hover:underline">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gov-blue px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-gov-blue">Forgot password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <button type="submit" className="w-full rounded-md bg-gov-blue py-2 text-white hover:bg-gov-light">
            Send reset link
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link to="/login" className="text-gov-blue hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
