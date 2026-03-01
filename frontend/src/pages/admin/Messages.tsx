import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/client';

const schema = z.object({
  receiverId: z.coerce.number().int().positive(),
  subject: z.string().min(1, 'Subject required').max(255),
  message: z.string().min(1, 'Message required'),
});
type FormData = z.infer<typeof schema>;

interface Business {
  id: number;
  email: string;
  business_name: string;
}

export default function AdminMessages() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    api.get<{ businesses: Business[] }>('/admin/businesses').then((res) => setBusinesses(res.data.businesses ?? []));
  }, []);

  const onSubmit = async (data: FormData) => {
    await api.post('/admin/messages', data);
    setSent(true);
    reset();
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Send message</h1>
      <p className="text-sm text-gray-500">Send compliance reminders or announcements to accommodation businesses.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {sent && <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">Message sent.</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">To (accommodation)</label>
            <select {...register('receiverId')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="">Select business</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.business_name} ({b.email})</option>
              ))}
            </select>
            {errors.receiverId && <p className="mt-1 text-sm text-red-600">{errors.receiverId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input type="text" {...register('subject')} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="e.g. Monthly submission reminder" />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea {...register('message')} rows={5} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Compliance reminder or announcement..." />
            {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          </div>
          <button type="submit" className="w-full rounded-md bg-gov-blue py-2 text-white hover:bg-gov-light">Send message</button>
        </div>
      </form>
    </div>
  );
}
