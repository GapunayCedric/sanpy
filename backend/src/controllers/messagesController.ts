import { Request, Response } from 'express';
import { query } from '../db/index.js';
import type { SendMessageBody } from '../validations/message.js';

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const senderId = req.user!.userId;
  const { receiverId, subject, message } = req.body as SendMessageBody;

  const receivers = await query<{ id: number }[]>('SELECT id FROM users WHERE id = ?', [receiverId]);
  if (!receivers[0]) {
    res.status(404).json({ message: 'Receiver not found' });
    return;
  }

  await query(
    'INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)',
    [senderId, receiverId, subject, message]
  );
  res.status(201).json({ message: 'Message sent' });
}

export async function getInbox(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const messages = await query<
    { id: number; sender_id: number; subject: string; message: string; read_status: number; created_at: string; sender_email?: string }[]
  >(
    `SELECT m.id, m.sender_id, m.subject, m.message, m.read_status, m.created_at, u.email AS sender_email
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.receiver_id = ?
     ORDER BY m.created_at DESC`,
    [userId]
  );
  res.json({ messages: messages || [] });
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const id = Number(req.params.id);

  await query('UPDATE messages SET read_status = 1 WHERE id = ? AND receiver_id = ?', [id, userId]);
  res.json({ message: 'Marked as read' });
}

export async function getBusinessListForAdmin(req: Request, res: Response): Promise<void> {
  const rows = await query<{ id: number; email: string; business_name: string }[]>(
    `SELECT u.id, u.email, b.business_name FROM users u JOIN businesses b ON b.user_id = u.id WHERE u.role = 'business' AND u.status = 'approved' ORDER BY b.business_name`
  );
  res.json({ businesses: rows || [] });
}
