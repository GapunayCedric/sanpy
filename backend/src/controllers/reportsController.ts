import { Request, Response } from 'express';
import { query } from '../db/index.js';
import type { ReportFilterQuery } from '../validations/report.js';

export async function getReportData(req: Request, res: Response): Promise<void> {
  const q = req.query as ReportFilterQuery & { month?: string; year?: string };
  const month = q.month ? Number(q.month) : undefined;
  const year = q.year ? Number(q.year) : undefined;
  const nationality = q.nationality;
  const gender = q.gender;
  const ageMin = q.ageMin;
  const ageMax = q.ageMax;
  const transportationMode = q.transportationMode;
  const businessId = q.businessId;

  let sql = `
    SELECT gr.*, b.business_name
    FROM guest_records gr
    JOIN businesses b ON b.id = gr.business_id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (month) {
    sql += ' AND MONTH(gr.check_in) = ?';
    params.push(month);
  }
  if (year) {
    sql += ' AND YEAR(gr.check_in) = ?';
    params.push(year);
  }
  if (nationality) {
    sql += ' AND gr.nationality = ?';
    params.push(nationality);
  }
  if (gender) {
    sql += ' AND gr.gender = ?';
    params.push(gender);
  }
  if (ageMin != null) {
    sql += ' AND gr.age >= ?';
    params.push(ageMin);
  }
  if (ageMax != null) {
    sql += ' AND gr.age <= ?';
    params.push(ageMax);
  }
  if (transportationMode) {
    sql += ' AND gr.transportation_mode = ?';
    params.push(transportationMode);
  }
  if (businessId) {
    sql += ' AND gr.business_id = ?';
    params.push(businessId);
  }

  sql += ' ORDER BY gr.check_in DESC';

  const records = await query(sql, params);
  res.json({ records });
}

export async function getReportFiltersMeta(req: Request, res: Response): Promise<void> {
  const nationalities = await query<{ nationality: string }[]>(
    'SELECT DISTINCT nationality FROM guest_records ORDER BY nationality'
  );
  const businesses = await query<{ id: number; business_name: string }[]>(
    'SELECT id, business_name FROM businesses ORDER BY business_name'
  );
  res.json({
    nationalities: Array.isArray(nationalities) ? nationalities : [],
    businesses: Array.isArray(businesses) ? businesses : [],
  });
}
