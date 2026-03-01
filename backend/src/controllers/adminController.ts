import { Request, Response } from 'express';
import { query } from '../db/index.js';
import type { ApproveRejectBody } from '../validations/auth.js';

export async function getPendingRegistrations(req: Request, res: Response): Promise<void> {
  const { status, search } = req.query as { status?: string; search?: string };
  let sql = `
    SELECT u.id, u.email, u.status, u.remarks, u.created_at,
           b.business_name, b.permit_number, b.owner_name, b.contact_number, b.address, b.barangay,
           b.permit_file_url, b.valid_id_url
    FROM users u
    JOIN businesses b ON b.user_id = u.id
    WHERE u.role = 'business'
  `;
  const params: (string | number)[] = [];
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

export async function getRegistrationById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const rows = await query<
    { id: number; email: string; status: string; remarks: string | null; created_at: string; business_name: string; permit_number: string; owner_name: string; contact_number: string; address: string; barangay: string | null; permit_file_url: string | null; valid_id_url: string | null }[]
  >(
    `SELECT u.id, u.email, u.status, u.remarks, u.created_at,
            b.business_name, b.permit_number, b.owner_name, b.contact_number, b.address, b.barangay,
            b.permit_file_url, b.valid_id_url
     FROM users u
     JOIN businesses b ON b.user_id = u.id
     WHERE u.id = ? AND u.role = 'business'`,
    [id]
  );
  const reg = rows[0];
  if (!reg) {
    res.status(404).json({ message: 'Registration not found' });
    return;
  }
  res.json(reg);
}

export async function approveRegistration(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { remarks } = req.body as ApproveRejectBody;

  const users = await query<{ id: number }[]>('SELECT id FROM users WHERE id = ? AND role = ? AND status = ?', [id, 'business', 'pending']);
  if (!users[0]) {
    res.status(404).json({ message: 'Pending registration not found' });
    return;
  }

  await query('UPDATE users SET status = ?, remarks = ? WHERE id = ?', ['approved', remarks ?? null, id]);
  res.json({ message: 'Registration approved' });
}

export async function rejectRegistration(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { remarks } = req.body as ApproveRejectBody;

  const users = await query<{ id: number }[]>('SELECT id FROM users WHERE id = ? AND role = ? AND status = ?', [id, 'business', 'pending']);
  if (!users[0]) {
    res.status(404).json({ message: 'Pending registration not found' });
    return;
  }

  await query('UPDATE users SET status = ?, remarks = ? WHERE id = ?', ['rejected', remarks ?? null, id]);
  res.json({ message: 'Registration rejected' });
}
