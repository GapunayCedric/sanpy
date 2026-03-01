import { query } from '../db/index.js';
async function getBusinessIdFromUser(req) {
    const userId = req.user?.userId;
    if (!userId)
        return null;
    const rows = await query('SELECT id FROM businesses WHERE user_id = ?', [userId]);
    return rows[0]?.id ?? null;
}
export async function createGuestRecord(req, res) {
    const businessId = await getBusinessIdFromUser(req);
    if (!businessId) {
        res.status(403).json({ message: 'Business not found' });
        return;
    }
    const body = req.body;
    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);
    const lengthOfStayDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    // determine how many guests and prepare demographics for storage
    let numberOfGuests = 1;
    let nationality = '';
    let gender = '';
    let age = 0;
    let guestDetailsJson = null;
    if (body.guests && body.guests.length > 0) {
        numberOfGuests = body.guests.length;
        // for backwards compatibility store first guest values in the simple columns
        nationality = body.guests[0].nationality;
        gender = body.guests[0].gender;
        // ageRange is a string like "10-15"; we cannot fit that into tinyint so leave age=0
        age = 0;
        guestDetailsJson = JSON.stringify(body.guests);
    }
    else {
        // legacy path
        numberOfGuests = body.numberOfGuests ?? 1;
        nationality = body.nationality;
        gender = body.gender;
        age = body.age ?? 0;
    }
    await query(`INSERT INTO guest_records (business_id, check_in, check_out, nationality, gender, age, transportation_mode, purpose, number_of_guests, length_of_stay_days, is_local_tourist, festival_related, guest_details)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
    ]);
    res.status(201).json({ message: 'Guest record created', lengthOfStayDays });
}
export async function getGuestRecords(req, res) {
    const businessId = await getBusinessIdFromUser(req);
    if (!businessId) {
        res.status(403).json({ message: 'Business not found' });
        return;
    }
    const { month, year } = req.query;
    let sql = 'SELECT * FROM guest_records WHERE business_id = ?';
    const params = [businessId];
    if (month && year) {
        sql += ' AND MONTH(check_in) = ? AND YEAR(check_in) = ?';
        params.push(month, year);
    }
    sql += ' ORDER BY check_in DESC';
    const records = await query(sql, params);
    res.json({ records });
}
