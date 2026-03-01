import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import api from '../api/client';

const transportOptions = [
  { value: 'private_car', label: 'Private Car' },
  { value: 'bus', label: 'Bus' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'plane', label: 'Plane' },
  { value: 'other', label: 'Other' },
];
const purposeOptions = [
  { value: 'leisure', label: 'Leisure' },
  { value: 'business', label: 'Business' },
  { value: 'event', label: 'Event' },
  { value: 'others', label: 'Others' },
];
// simplified gender options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
// age range buckets for dropdown
const ageRanges = [
  '0-9',
  '10-15',
  '16-25',
  '26-35',
  '36-45',
  '46-60',
  '61+',
];
// minimal list of countries (add or replace with full list as needed)
const nationalities = [
  'Philippines',
  'United States',
  'Canada',
  'Australia',
  'United Kingdom',
  'Japan',
  'China',
  'India',
  'Germany',
  'France',
  'Spain',
  // ... more entries can be added here
];

const guestDetail = z.object({
  nationality: z.string().min(2, 'Required'),
  gender: z.enum(['male','female']),
  ageRange: z.string().min(1, 'Required'),
  count: z.coerce.number().int().min(1, 'At least 1').max(1000),
});

const schema = z
  .object({
    checkIn: z.string().min(1, 'Required'),
    checkOut: z.string().min(1, 'Required'),
    transportationMode: z.enum(['private_car', 'bus', 'van', 'motorcycle', 'plane', 'other']),
    purpose: z.enum(['leisure', 'business', 'event', 'others']),
    guests: z.array(guestDetail).min(1, 'At least one guest is required'),
    isLocalTourist: z.boolean().optional(),
    festivalRelated: z.boolean().optional(),
  })
  .refine((d) => new Date(d.checkOut) >= new Date(d.checkIn), {
    message: 'Check-out must be on or after check-in',
    path: ['checkOut'],
  });
export type GuestEntryFormData = z.infer<typeof schema>;

interface GuestEntryFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export default function GuestEntryForm({ onSuccess, compact = false }: GuestEntryFormProps) {
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, control, formState: { errors }, reset } = useForm<GuestEntryFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      transportationMode: 'private_car',
      purpose: 'leisure',
      guests: [{ nationality: '', gender: 'male', ageRange: ageRanges[0], count: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ name: 'guests', control });

  const checkIn = watch('checkIn');
  const checkOut = watch('checkOut');
  let lengthOfStay = 0;
  if (checkIn && checkOut) {
    const a = new Date(checkIn);
    const b = new Date(checkOut);
    lengthOfStay = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  }

  const onSubmit = async (data: GuestEntryFormData) => {
    setError('');
    const payload: any = { ...data };
    if (data.guests) {
      payload.numberOfGuests = data.guests.reduce((sum: number, g: any) => sum + (g.count || 1), 0);
    }
    try {
      await api.post('/business/guest-records', payload);
      reset();
      onSuccess?.();
    } catch (e: unknown) {
      const errorResponse = e as { response?: { data?: { message?: string; errors?: Array<{ path: string; message: string }> } } };
      const message = errorResponse?.response?.data?.message ?? 'Failed to save';
      const errors = errorResponse?.response?.data?.errors;
      
      if (errors && Array.isArray(errors)) {
        const errorDetails = errors.map(err => `${err.path}: ${err.message}`).join(' | ');
        setError(`${message} - ${errorDetails}`);
      } else {
        setError(message);
      }
    }
  };

  const inputClass = compact ? 'mt-1 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm' : 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2';
  const spaceClass = compact ? 'space-y-3' : 'space-y-4';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={spaceClass}>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-in date</label>
          <input type="date" {...register('checkIn')} className={inputClass} />
          {errors.checkIn && <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Check-out date</label>
          <input type="date" {...register('checkOut')} className={inputClass} />
          {errors.checkOut && <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>}
        </div>
      </div>
      <div className="rounded bg-gray-50 px-3 py-2 text-sm">Length of stay: <strong>{lengthOfStay}</strong> day(s)</div>

      {/* dynamic guest demographics */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid gap-4 sm:grid-cols-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationality <span className="text-red-500">*</span></label>
              <select
                {...register(`guests.${index}.nationality` as const)}
                className={`${inputClass} ${errors.guests?.[index]?.nationality ? 'border-red-500' : ''}`}
              >
                <option value="">Select nationality</option>
                {nationalities.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.guests?.[index]?.nationality && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guests?.[index]?.nationality?.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select
                {...register(`guests.${index}.gender` as const)}
                className={`${inputClass} ${errors.guests?.[index]?.gender ? 'border-red-500' : ''}`}
              >
                {genderOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {errors.guests?.[index]?.gender && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guests?.[index]?.gender?.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age range <span className="text-red-500">*</span></label>
              <select
                {...register(`guests.${index}.ageRange` as const)}
                className={`${inputClass} ${errors.guests?.[index]?.ageRange ? 'border-red-500' : ''}`}
              >
                {ageRanges.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.guests?.[index]?.ageRange && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guests?.[index]?.ageRange?.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Count <span className="text-red-500">*</span></label>
              <input
                type="number"
                {...register(`guests.${index}.count` as const)}
                min={1}
                max={1000}
                className={`${inputClass} ${errors.guests?.[index]?.count ? 'border-red-500' : ''}`}
              />
              {errors.guests?.[index]?.count && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.guests?.[index]?.count?.message as string}
                </p>
              )}
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="self-start text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ nationality: '', gender: 'male', ageRange: ageRanges[0], count: 1 })}
          className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
        >
          + Add guest
        </button>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Mode of transportation</label>
        <select {...register('transportationMode')} className={inputClass}>
          {transportOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Purpose of visit</label>
        <select {...register('purpose')} className={inputClass}>
          {purposeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {/* Guest summary by nationality and gender */}
      {fields.length > 0 && (
        <div className="rounded bg-blue-50 px-4 py-3 text-sm">
          <p className="mb-2 font-medium text-blue-900">Guests Summary</p>
          <div className="space-y-1 text-blue-800">
            <p>
              <strong>Total guests:</strong>{' '}
              {fields.reduce((sum, _, i) => sum + (parseInt(watch(`guests.${i}.count` as const) as unknown as string) || 1), 0)}
            </p>
            {(() => {
              const summaryByNationality: {
                [key: string]: { male: number; female: number };
              } = {};
              fields.forEach((_, i) => {
                const nat = watch(`guests.${i}.nationality` as const) || 'Unknown';
                const gen = watch(`guests.${i}.gender` as const) || '';
                const count = parseInt(watch(`guests.${i}.count` as const) as unknown as string) || 1;
                if (!summaryByNationality[nat]) {
                  summaryByNationality[nat] = { male: 0, female: 0 };
                }
                if (gen === 'male') summaryByNationality[nat].male += count;
                else if (gen === 'female') summaryByNationality[nat].female += count;
              });
              return Object.entries(summaryByNationality).map(([nat, counts]) => (
                <p key={nat}>
                  <strong>{nat}:</strong> {counts.male + counts.female} (Male: {counts.male}, Female:{' '}
                  {counts.female})
                </p>
              ));
            })()}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('isLocalTourist')} className="rounded border-gray-300" />
          <span className="text-sm">Local tourist</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('festivalRelated')} className="rounded border-gray-300" />
          <span className="text-sm">Festival-related (e.g. Coco Festival)</span>
        </label>
      </div>
      <button type="submit" className="w-full rounded-md bg-gov-blue py-2 text-white hover:bg-gov-light">
        Save guest record
      </button>
    </form>
  );
}
