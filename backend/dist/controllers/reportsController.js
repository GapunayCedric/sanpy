import { query } from '../db/index.js';
export async function getReportData(req, res) {
    const q = req.query;
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
    const params = [];
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
export async function getReportFiltersMeta(req, res) {
    const nationalities = await query('SELECT DISTINCT nationality FROM guest_records ORDER BY nationality');
    const businesses = await query('SELECT id, business_name FROM businesses ORDER BY business_name');
    res.json({
        nationalities: Array.isArray(nationalities) ? nationalities : [],
        businesses: Array.isArray(businesses) ? businesses : [],
    });
}
