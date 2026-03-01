import { useEffect, useState } from "react";
import api from "../../api/client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportRecordRow {
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
  business_name: string;
}





interface FiltersMeta {
  nationalities: { nationality: string }[];
  businesses: { id: number; business_name: string }[];
}

export default function Reports() {
  const [records, setRecords] = useState<ReportRecordRow[]>([]);
  const [meta, setMeta] = useState<FiltersMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    nationality: "",
    gender: "",
    ageMin: "",
    ageMax: "",
    transportationMode: "",
    businessId: "",
  });

  useEffect(() => {
    api
      .get<FiltersMeta>("/admin/reports/filters")
      .then((res) => setMeta(res.data))
      .catch(() => setMeta({ nationalities: [], businesses: [] }));
  }, []);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== "" && v != null) params.set(k, String(v));
    });
    api
      .get<{ records: ReportRecordRow[] }>(`/admin/reports?${params}`)
      .then((res) => {
        setRecords(Array.isArray(res.data?.records) ? res.data.records : []);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  // Load report data when page opens (show all records by default)
  useEffect(() => {
    load();
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Tourist Demographic Report – San Pablo City, Laguna", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    const headers = [
      [
        "Check-in",
        "Check-out",
        "Nationality",
        "Gender",
        "Age",
        "Transport",
        "Purpose",
        "Guests",
        "Stay (days)",
        "Business",
      ],
    ];
    const rows = records.map((r) => [
      r.check_in,
      r.check_out,
      r.nationality,
      r.gender,
      String(r.age),
      r.transportation_mode,
      r.purpose,
      String(r.number_of_guests),
      String(r.length_of_stay_days),
      r.business_name,
    ]);
    autoTable(doc, { head: headers, body: rows, startY: 34 });
    doc.save("tourist-report.pdf");
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      records.map((r) => ({
        "Check-in": r.check_in,
        "Check-out": r.check_out,
        Nationality: r.nationality,
        Gender: r.gender,
        Age: r.age,
        Transport: r.transportation_mode,
        Purpose: r.purpose,
        Guests: r.number_of_guests,
        "Length of stay (days)": r.length_of_stay_days,
        Business: r.business_name,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "tourist-report.xlsx");
  };

  const exportCSV = () => {
    const headers = [
      "check_in",
      "check_out",
      "nationality",
      "gender",
      "age",
      "transportation_mode",
      "purpose",
      "number_of_guests",
      "length_of_stay_days",
      "business_name",
    ];
    const line = (r: ReportRecordRow) =>
      headers
        .map((h) => (r as unknown as Record<string, unknown>)[h])
        .join(",");
    const csv = [headers.join(","), ...records.map(line)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tourist-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gov-blue">Reports</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="font-medium text-gov-blue">Filters</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs text-gray-500">Month</label>
            <select
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Year</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) =>
                setFilters((f) => ({ ...f, year: e.target.value }))
              }
              placeholder="e.g. 2025"
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Nationality</label>
            <select
              value={filters.nationality}
              onChange={(e) =>
                setFilters((f) => ({ ...f, nationality: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {meta?.nationalities?.map((n) => (
                <option key={n.nationality} value={n.nationality}>
                  {n.nationality}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Gender</label>
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters((f) => ({ ...f, gender: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Age min</label>
            <input
              type="number"
              value={filters.ageMin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, ageMin: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Age max</label>
            <input
              type="number"
              value={filters.ageMax}
              onChange={(e) =>
                setFilters((f) => ({ ...f, ageMax: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Transport</label>
            <select
              value={filters.transportationMode}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  transportationMode: e.target.value,
                }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="private_car">Private Car</option>
              <option value="bus">Bus</option>
              <option value="van">Van</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="plane">Plane</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Accommodation</label>
            <select
              value={filters.businessId}
              onChange={(e) =>
                setFilters((f) => ({ ...f, businessId: e.target.value }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">All</option>
              {meta?.businesses?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.business_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded bg-gov-blue px-4 py-2 text-sm text-white hover:bg-gov-light disabled:opacity-50"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={exportPDF}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={exportExcel}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Print
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <p className="p-8 text-center text-gray-500">Loading...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 print:block">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Check-in
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Check-out
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Nationality
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Gender
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Age
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Transport
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Purpose
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Guests
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Stay (days)
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">
                  Business
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-sm">
                    {r.check_in}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm">
                    {r.check_out}
                  </td>
                  <td className="px-4 py-2 text-sm">{r.nationality}</td>
                  <td className="px-4 py-2 text-sm">{r.gender}</td>
                  <td className="px-4 py-2 text-sm">{r.age}</td>
                  <td className="px-4 py-2 text-sm">{r.transportation_mode}</td>
                  <td className="px-4 py-2 text-sm">{r.purpose}</td>
                  <td className="px-4 py-2 text-sm">{r.number_of_guests}</td>
                  <td className="px-4 py-2 text-sm">{r.length_of_stay_days}</td>
                  <td className="px-4 py-2 text-sm">{r.business_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && records.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No records match the filters.
          </p>
        )}
      </div>
    </div>
  );
}
