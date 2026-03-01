import { useEffect, useState } from 'react';
import api from '../../api/client';

interface Registration {
  id: number;
  email: string;
  status: string;
  remarks: string | null;
  created_at: string;
  business_name: string;
  permit_number: string;
  owner_name: string;
  contact_number: string;
  address: string;
  barangay: string | null;
  permit_file_url: string | null;
  valid_id_url: string | null;
}

export default function RegistrationApproval() {
  const [list, setList] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [detail, setDetail] = useState<Registration | null>(null);

  const load = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());
    api.get<{ registrations: Registration[] }>(`/admin/registrations?${params}`).then((res) => {
      setList(res.data.registrations ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleApprove = (id: number) => {
    api.post(`/admin/registrations/${id}/approve`, { remarks: remarks[id] ?? undefined })
      .then(() => { load(); setDetail(null); setRemarks((r) => ({ ...r, [id]: '' })); });
  };
  const handleReject = (id: number) => {
    api.post(`/admin/registrations/${id}/reject`, { remarks: remarks[id] ?? undefined })
      .then(() => { load(); setDetail(null); setRemarks((r) => ({ ...r, [id]: '' })); });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Registration approval</h1>
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search business, email, permit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="button" onClick={load} className="rounded-md bg-gov-blue px-4 py-2 text-sm text-white hover:bg-gov-light">
          Search
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Business</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Owner</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {list.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-sm">{r.business_name}</td>
                  <td className="px-4 py-2 text-sm">{r.owner_name}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded px-2 py-1 text-xs ${
                      r.status === 'approved' ? 'bg-green-100 text-green-800' :
                      r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    <button type="button" onClick={() => setDetail(r)} className="text-gov-blue hover:underline text-sm mr-2">View</button>
                    {r.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => handleApprove(r.id)} className="text-green-600 hover:underline text-sm mr-2">Approve</button>
                        <button type="button" onClick={() => handleReject(r.id)} className="text-red-600 hover:underline text-sm">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gov-blue">{detail.business_name}</h2>
            <p className="text-sm text-gray-500">{detail.email} · Permit: {detail.permit_number}</p>
            <p className="mt-2 text-sm">Owner: {detail.owner_name} · Contact: {detail.contact_number}</p>
            <p className="text-sm">Address: {detail.address}{detail.barangay ? `, ${detail.barangay}` : ''}</p>
            {detail.remarks && <p className="mt-2 text-sm text-gray-600">Remarks: {detail.remarks}</p>}
            <div className="mt-4">
              <p className="text-sm font-medium">Documents</p>
              {detail.permit_file_url && (
                <a href={detail.permit_file_url} target="_blank" rel="noreferrer" className="text-gov-blue hover:underline block text-sm">Business permit</a>
              )}
              {detail.valid_id_url && (
                <a href={detail.valid_id_url} target="_blank" rel="noreferrer" className="text-gov-blue hover:underline block text-sm">Valid ID</a>
              )}
            </div>
            {detail.status === 'pending' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Remarks (optional)</label>
                <textarea
                  value={remarks[detail.id] ?? ''}
                  onChange={(e) => setRemarks((r) => ({ ...r, [detail.id]: e.target.value }))}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => handleApprove(detail.id)} className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">Approve</button>
                  <button type="button" onClick={() => handleReject(detail.id)} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Reject</button>
                </div>
              </div>
            )}
            <button type="button" onClick={() => setDetail(null)} className="mt-4 text-gray-500 hover:text-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
