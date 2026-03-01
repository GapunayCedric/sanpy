import { query } from '../db/index.js';
export async function getPendingRegistrations(req, res) {
    const { status, search } = req.query;
    let sql = `
    SELECT u.id, u.email, u.status, u.remarks, u.created_at,
           b.business_name, b.permit_number, b.owner_name, b.contact_number, b.address, b.barangay,
           b.permit_file_url, b.valid_id_url
    FROM users u
    JOIN businesses b ON b.user_id = u.id
    WHERE u.role = 'business'
  `;
    const params = [];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        sql += ' AND u.status = ?';
        params.push(status);
    }
    if (search && String(search).trim()) {
        sql += ' AND (b.business_name LIKE ? OR u.email LIKE ? OR b.permit_number LIKE ?)';
        const term = `%${String(search).trim()}%`;
        params.push(term, term, term);
    }
    sql += ' ORDER BY u.created_at DESC';
    const list = await query(sql, params);
    res.json({ registrations: list });
}
export async function getRegistrationById(req, res) {
    const id = Number(req.params.id);
    const rows = await query(`SELECT u.id, u.email, u.status, u.remarks, u.created_at,
            b.business_name, b.permit_number, b.owner_name, b.contact_number, b.address, b.barangay,
            b.permit_file_url, b.valid_id_url
     FROM users u
     JOIN businesses b ON b.user_id = u.id
     WHERE u.id = ? AND u.role = 'business'`, [id]);
    const reg = rows[0];
    if (!reg) {
        res.status(404).json({ message: 'Registration not found' });
        return;
    }
    res.json(reg);
}
export async function approveRegistration(req, res) {
    const id = Number(req.params.id);
    const { remarks } = req.body;
    const users = await query('SELECT id FROM users WHERE id = ? AND role = ? AND status = ?', [id, 'business', 'pending']);
    if (!users[0]) {
        res.status(404).json({ message: 'Pending registration not found' });
        return;
    }
    await query('UPDATE users SET status = ?, remarks = ? WHERE id = ?', ['approved', remarks ?? null, id]);
    res.json({ message: 'Registration approved' });
}
export async function rejectRegistration(req, res) {
    const id = Number(req.params.id);
    const { remarks } = req.body;
    const users = await query('SELECT id FROM users WHERE id = ? AND role = ? AND status = ?', [id, 'business', 'pending']);
    if (!users[0]) {
        res.status(404).json({ message: 'Pending registration not found' });
        return;
    }
    await query('UPDATE users SET status = ?, remarks = ? WHERE id = ?', ['rejected', remarks ?? null, id]);
    res.json({ message: 'Registration rejected' });
}
