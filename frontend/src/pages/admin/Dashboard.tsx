import { useEffect, useState } from 'react';
import api from '../../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  totalActiveBusinesses: number;
  touristsThisMonth: number;
  touristsThisYear: number;
  pendingRegistrations: number;
  submissionComplianceRate: number;
  topNationalities: { nationality: string; total: number }[];
  touristTrend12Months: { month: number; year: number; total: number }[];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardData>('/admin/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="py-12 text-center">Loading...</div>;

  const trendData = data.touristTrend12Months.map((t) => ({
    name: `${MONTHS[t.month - 1]} ${t.year}`,
    total: t.total,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active accommodation businesses</p>
          <p className="text-2xl font-bold text-gov-blue">{data.totalActiveBusinesses}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tourists this month</p>
          <p className="text-2xl font-bold text-gov-blue">{data.touristsThisMonth}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Tourists this year</p>
          <p className="text-2xl font-bold text-gov-blue">{data.touristsThisYear}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Pending registrations</p>
          <p className="text-2xl font-bold text-amber-600">{data.pendingRegistrations}</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Submission compliance rate</p>
          <p className="text-2xl font-bold text-gov-blue">{data.submissionComplianceRate}%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-gov-blue">Top 5 nationalities</p>
          <ul className="list-inside list-disc text-sm text-gray-700">
            {data.topNationalities.length === 0
              ? <li>No data yet</li>
              : data.topNationalities.map((n) => (
                  <li key={n.nationality}>{n.nationality}: {n.total}</li>
                ))}
          </ul>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-medium text-gov-blue">Tourist trend (last 12 months)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#2c5282" name="Tourists" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
