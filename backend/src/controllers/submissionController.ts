import { Request, Response } from 'express';
import { query } from '../db/index.js';

async function getBusinessIdFromUser(req: Request): Promise<number | null> {
  const userId = req.user?.userId;
  if (!userId) return null;
  const rows = await query<{ id: number }[]>('SELECT id FROM businesses WHERE user_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

export async function getSubmissionStatus(req: Request, res: Response): Promise<void> {
  const businessId = await getBusinessIdFromUser(req);
  if (!businessId) {
    res.status(403).json({ message: 'Business not found' });
    return;
  }

  const submissions = await query<
    { id: number; month: number; year: number; status: string; submitted_at: string | null }[]
  >(
    'SELECT id, month, year, status, submitted_at FROM monthly_submissions WHERE business_id = ? ORDER BY year DESC, month DESC',
    [businessId]
  );
  res.json({ submissions });
}

export async function submitMonth(req: Request, res: Response): Promise<void> {
  const businessId = await getBusinessIdFromUser(req);
  if (!businessId) {
    res.status(403).json({ message: 'Business not found' });
    return;
  }

  const { month, year } = req.body as { month: number; year: number };
  if (!month || !year || month < 1 || month > 12) {
    res.status(400).json({ message: 'Invalid month or year' });
    return;
  }

  const existing = await query<{ id: number; status: string }[]>(
    'SELECT id, status FROM monthly_submissions WHERE business_id = ? AND month = ? AND year = ?',
    [businessId, month, year]
  );

  if (existing[0]?.status === 'locked') {
    res.status(400).json({ message: 'This month is already locked' });
    return;
  }

  if (existing.length > 0) {
    await query(
      'UPDATE monthly_submissions SET status = ?, submitted_at = NOW() WHERE id = ?',
      ['locked', existing[0].id]
    );
  } else {
    await query(
      'INSERT INTO monthly_submissions (business_id, month, year, status, submitted_at) VALUES (?, ?, ?, ?, NOW())',
      [businessId, month, year, 'locked']
    );
  }

  res.json({ message: 'Month submitted and locked successfully' });
}
