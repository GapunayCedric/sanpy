import { useEffect, useState } from 'react';
import api from '../../api/client';
import GuestEntryForm from '../../components/GuestEntryForm';

interface GuestRecord {
  id: number;
  check_in: string;
  check_out: string;
  nationality: string;
  gender: string;
  age: number;
  transportation_mode: string;
  purpose: string;
  number_of_guests: number;
  length_of_stay_days: number;
  created_at: string;
  guest_details?: { nationality: string; gender: string; ageRange: string }[];
}

export default function GuestRecords() {
  const [records, setRecords] = useState<GuestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (year) params.set('year', year);
    api
      .get<{ records: GuestRecord[] }>(`/business/guest-records?${params}`)
      .then((res) => {
        const recs = (res.data.records ?? []).map((r) => {
          if (r.guest_details && typeof r.guest_details === 'string') {
            try {
              // mysql returns json columns as string
              r.guest_details = JSON.parse(r.guest_details as unknown as string);
            } catch {
              /* ignore */
            }
          }
          return r;
        });
        setRecords(recs);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString() : '—');
  const formatLabel = (s: string) => (s || '').replace(/_/g, ' ');

  const handleEntrySuccess = () => {
    setModalOpen(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gov-blue">Guest records</h1>
          <p className="mt-1 text-sm text-gray-500">
            All guest entries. Add new records with the button below.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gov-blue px-4 py-2 text-sm font-medium text-white hover:bg-gov-light"
        >
          <span>+</span>
          Add guest entry
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="">All</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 2025"
            className="w-24 rounded border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded bg-gov-blue px-4 py-2 text-sm text-white hover:bg-gov-light"
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-gray-500">Loading records...</p>
      ) : records.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No guest records yet. Click <strong>Add guest entry</strong> to add one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 font-medium text-gray-700">Check-in</th>
                <th className="px-4 py-2 font-medium text-gray-700">Check-out</th>
                <th className="px-4 py-2 font-medium text-gray-700">Nationality</th>
                <th className="px-4 py-2 font-medium text-gray-700">Gender</th>
                <th className="px-4 py-2 font-medium text-gray-700">Age</th>
                {/* if there are multiple guests we still show first entry for brevity */}
                <th className="px-4 py-2 font-medium text-gray-700">Transport</th>
                <th className="px-4 py-2 font-medium text-gray-700">Purpose</th>
                <th className="px-4 py-2 font-medium text-gray-700">Guests</th>
                <th className="px-4 py-2 font-medium text-gray-700">Stay (days)</th>
                <th className="px-4 py-2 font-medium text-gray-700">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-2">{formatDate(r.check_in)}</td>
                  <td className="whitespace-nowrap px-4 py-2">{formatDate(r.check_out)}</td>
                  <td className="px-4 py-2">
                    {r.guest_details && r.guest_details.length > 0
                      ? r.guest_details[0].nationality
                      : r.nationality}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {r.guest_details && r.guest_details.length > 0
                      ? formatLabel(r.guest_details[0].gender)
                      : formatLabel(r.gender)}
                  </td>
                  <td className="px-4 py-2">
                    {r.guest_details && r.guest_details.length > 0
                      ? r.guest_details[0].ageRange
                      : r.age}
                  </td>
                  <td className="px-4 py-2 capitalize">{formatLabel(r.transportation_mode)}</td>
                  <td className="px-4 py-2 capitalize">{formatLabel(r.purpose)}</td>
                  <td className="px-4 py-2">{r.number_of_guests}</td>
                  <td className="px-4 py-2">{r.length_of_stay_days}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-500">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Guest entry modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gov-blue">Add guest entry</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <GuestEntryForm onSuccess={handleEntrySuccess} compact />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
