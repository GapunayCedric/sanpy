import { Request, Response } from 'express';
import { query } from '../db/index.js';
import type { GuestRecordBody } from '../validations/guest.js';

async function getBusinessIdFromUser(req: Request): Promise<number | null> {
  const userId = req.user?.userId;
  if (!userId) return null;
  const rows = await query<{ id: number }[]>('SELECT id FROM businesses WHERE user_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

export async function createGuestRecord(req: Request, res: Response): Promise<void> {
  const businessId = await getBusinessIdFromUser(req);
  if (!businessId) {
    res.status(403).json({ message: 'Business not found' });
    return;
  }

  const body = req.body as GuestRecordBody;
  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);
  const lengthOfStayDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // determine how many guests and prepare demographics for storage
  let numberOfGuests = 1;
  let nationality = '';
  let gender = '';
  let age = 0;
  let guestDetailsJson: string | null = null;

  if (body.guests && body.guests.length > 0) {
    // sum up counts from all guest entries
    numberOfGuests = body.guests.reduce((sum, g) => sum + (g.count || 1), 0);
    // for backwards compatibility store first guest values in the simple columns
    nationality = body.guests[0].nationality;
    gender = body.guests[0].gender;
    // ageRange is a string like "10-15"; we cannot fit that into tinyint so leave age=0
    age = 0;
    guestDetailsJson = JSON.stringify(body.guests);
  } else {
    // legacy path
    numberOfGuests = body.numberOfGuests ?? 1;
    nationality = body.nationality;
    gender = body.gender;
    age = body.age ?? 0;
  }

  await query(
    `INSERT INTO guest_records (business_id, check_in, check_out, nationality, gender, age, transportation_mode, purpose, number_of_guests, length_of_stay_days, is_local_tourist, festival_related, guest_details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      businessId,
      body.checkIn,
      body.checkOut,
      nationality,
      gender,
      age,
      body.transportationMode,
      body.purpose,
      numberOfGuests,
      lengthOfStayDays,
      body.isLocalTourist ? 1 : 0,
      body.festivalRelated ? 1 : 0,
      guestDetailsJson,
    ]
  );

  res.status(201).json({ message: 'Guest record created', lengthOfStayDays });
}

export async function getGuestRecords(req: Request, res: Response): Promise<void> {
  const businessId = await getBusinessIdFromUser(req);
  if (!businessId) {
    res.status(403).json({ message: 'Business not found' });
    return;
  }

  const { month, year } = req.query as { month?: string; year?: string };
  let sql = 'SELECT * FROM guest_records WHERE business_id = ?';
  const params: (number | string)[] = [businessId];
  if (month && year) {
    sql += ' AND MONTH(check_in) = ? AND YEAR(check_in) = ?';
    params.push(month, year);
  }
  sql += ' ORDER BY check_in DESC';

  const records = await query(sql, params);
  res.json({ records });
}
