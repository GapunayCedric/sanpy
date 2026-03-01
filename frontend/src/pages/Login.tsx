import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data.email, data.password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gov-blue px-4 py-8">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-center text-xl font-semibold text-gov-blue">
          SA Tourist Demographic Study
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">San Pablo City, Laguna</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gov-blue focus:outline-none focus:ring-1 focus:ring-gov-blue"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gov-blue focus:outline-none focus:ring-1 focus:ring-gov-blue"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-gov-blue hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-gov-blue py-2 text-white hover:bg-gov-light focus:outline-none focus:ring-2 focus:ring-gov-blue"
          >
            Sign in
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Accommodation business?{' '}
          <Link to="/register" className="font-medium text-gov-blue hover:underline">
            Request registration
          </Link>
        </p>
      </div>
    </div>
  );
}
