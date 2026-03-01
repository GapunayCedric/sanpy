import { useState } from 'react';
import GuestEntryForm from '../../components/GuestEntryForm';

export default function GuestEntry() {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-gov-blue">Guest data entry</h1>
      <p className="mt-1 text-sm text-gray-500">Record tourist demographic data</p>
      {success && (
        <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">Guest record saved.</div>
      )}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <GuestEntryForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
