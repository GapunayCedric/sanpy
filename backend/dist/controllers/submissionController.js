import { query } from '../db/index.js';
async function getBusinessIdFromUser(req) {
    const userId = req.user?.userId;
    if (!userId)
        return null;
    const rows = await query('SELECT id FROM businesses WHERE user_id = ?', [userId]);
    return rows[0]?.id ?? null;
}
export async function getSubmissionStatus(req, res) {
    const businessId = await getBusinessIdFromUser(req);
    if (!businessId) {
        res.status(403).json({ message: 'Business not found' });
        return;
    }
    const submissions = await query('SELECT id, month, year, status, submitted_at FROM monthly_submissions WHERE business_id = ? ORDER BY year DESC, month DESC', [businessId]);
    res.json({ submissions });
}
export async function submitMonth(req, res) {
    const businessId = await getBusinessIdFromUser(req);
    if (!businessId) {
        res.status(403).json({ message: 'Business not found' });
        return;
    }
    const { month, year } = req.body;
    if (!month || !year || month < 1 || month > 12) {
        res.status(400).json({ message: 'Invalid month or year' });
        return;
    }
    const existing = await query('SELECT id, status FROM monthly_submissions WHERE business_id = ? AND month = ? AND year = ?', [businessId, month, year]);
    if (existing[0]?.status === 'locked') {
        res.status(400).json({ message: 'This month is already locked' });
        return;
    }
    if (existing.length > 0) {
        await query('UPDATE monthly_submissions SET status = ?, submitted_at = NOW() WHERE id = ?', ['locked', existing[0].id]);
    }
    else {
        await query('INSERT INTO monthly_submissions (business_id, month, year, status, submitted_at) VALUES (?, ?, ?, ?, NOW())', [businessId, month, year, 'locked']);
    }
    res.json({ message: 'Month submitted and locked successfully' });
}
