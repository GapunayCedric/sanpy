import { useEffect, useState } from 'react';
import api from '../../api/client';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#1e3a5f', '#2c5282', '#3182ce', '#63b3ed', '#90cdf4', '#bee3f8'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DashboardData {
  guestsThisMonth: number;
  guestsThisYear: number;
  nationalityBreakdown: { nationality: string; total: number }[];
  monthlyCount: { month: number; total: number }[];
  genderDistribution: { gender: string; total: number }[];
  averageLengthOfStay: number;
  mostCommonTransport: string | null;
}

const emptyData: DashboardData = {
  guestsThisMonth: 0,
  guestsThisYear: 0,
  nationalityBreakdown: [],
  monthlyCount: [],
  genderDistribution: [],
  averageLengthOfStay: 0,
  mostCommonTransport: null,
};

function safeArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? val : [];
}

function safeNumber(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  return 0;
}

export default function BusinessDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    api
      .get('/business/dashboard')
      .then((res) => {
        const raw = res.data || {};
        setData({
          guestsThisMonth: safeNumber(raw.guestsThisMonth),
          guestsThisYear: safeNumber(raw.guestsThisYear),
          nationalityBreakdown: safeArray(raw.nationalityBreakdown),
          monthlyCount: safeArray(raw.monthlyCount),
          genderDistribution: safeArray(raw.genderDistribution),
          averageLengthOfStay: safeNumber(raw.averageLengthOfStay),
          mostCommonTransport: raw.mostCommonTransport ?? null,
        });
      })
      .catch((err) => {
        setLoading(false);
        const status = err.response?.status;
        const message = err.response?.data?.message;
        if (status === 403) {
          setError(message || 'Business account not found. Please contact the Tourism Office.');
        } else {
          setError(message || 'Could not load dashboard. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gov-blue">Dashboard</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Unable to load dashboard</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const safe = data ?? emptyData;
  const monthlyArr = safeArray(safe.monthlyCount) as { month: number; total: number }[];
  const monthlyWithNames = monthlyArr.map((m) => ({
    name: MONTH_NAMES[(m.month || 1) - 1] ?? String(m.month),
    total: safeNumber(m.total),
  }));
  const nationalityArr = safeArray(safe.nationalityBreakdown) as { nationality: string; total: number }[];
  const pieData = nationalityArr.map((n) => ({
    name: n.nationality || 'Unknown',
    value: safeNumber(n.total),
  }));
  const genderArr = safeArray(safe.genderDistribution) as { gender: string; total: number }[];
  const genderData = genderArr.map((g) => ({
    name: (g.gender || 'Unknown').replace(/_/g, ' '),
    count: safeNumber(g.total),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Guests this month</p>
          <p className="text-2xl font-bold text-gov-blue">{safe.guestsThisMonth}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Guests this year</p>
          <p className="text-2xl font-bold text-gov-blue">{safe.guestsThisYear}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Avg. length of stay (days)</p>
          <p className="text-2xl font-bold text-gov-blue">{safe.averageLengthOfStay.toFixed(1)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Most common transport</p>
          <p className="text-lg font-semibold text-gov-blue capitalize">
            {(safe.mostCommonTransport ?? '—').replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-medium text-gov-blue">Nationality breakdown</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-gray-400">No guest data yet</div>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 font-medium text-gov-blue">Gender distribution</h2>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={genderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" name="Guests" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-gray-400">No guest data yet</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-medium text-gov-blue">Monthly tourist count</h2>
        {monthlyWithNames.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyWithNames}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#2c5282" name="Guests" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-400">No guest data yet. Add records in Guest Entry.</div>
        )}
      </div>
    </div>
  );
}
