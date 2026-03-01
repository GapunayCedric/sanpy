import { useEffect, useState } from 'react';
import api from '../../api/client';

interface Submission {
  id: number;
  month: number;
  year: number;
  status: string;
  submitted_at: string | null;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<{ month: number; year: number } | null>(null);

  const load = () => {
    api.get<{ submissions: Submission[] }>('/business/submissions').then((res) => {
      setSubmissions(res.data.submissions ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const now = new Date();
  const prevMonth = now.getMonth(); // 0-indexed
  const prevYear = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const prevMonthNum = prevMonth === 0 ? 12 : prevMonth;

  const handleSubmit = (month: number, year: number) => {
    setSubmitting({ month, year });
    api.post('/business/submissions', { month, year })
      .then(() => load())
      .finally(() => setSubmitting(null));
  };

  if (loading) return <div className="py-12 text-center">Loading...</div>;

  const lastMonthSubmitted = submissions.find((s) => s.month === prevMonthNum && s.year === prevYear);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Monthly submissions</h1>
      <p className="text-sm text-gray-500">
        Confirm and lock previous month&apos;s data. Once submitted, that month cannot be edited.
      </p>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-medium text-gov-blue">Submit previous month</h2>
        <p className="mt-1 text-sm text-gray-600">
          {MONTHS[prevMonthNum - 1]} {prevYear}
        </p>
        {lastMonthSubmitted?.status === 'locked' ? (
          <p className="mt-2 text-sm text-green-600">Submitted</p>
        ) : (
          <button
            type="button"
            disabled={!!submitting}
            onClick={() => handleSubmit(prevMonthNum, prevYear)}
            className="mt-2 rounded-md bg-gov-blue px-4 py-2 text-white hover:bg-gov-light disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Confirm & submit month'}
          </button>
        )}
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Month / Year</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Submitted at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {submissions.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No submissions yet</td></tr>
            ) : (
              submissions.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2 text-sm">{MONTHS[s.month - 1]} {s.year}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded px-2 py-1 text-xs font-medium ${
                      s.status === 'locked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {s.status === 'locked' ? 'Submitted' : s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
