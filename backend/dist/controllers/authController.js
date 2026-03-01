import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/index.js';
import { config } from '../config/index.js';
const SALT_ROUNDS = 10;
function signToken(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}
export async function login(req, res) {
    const { email, password } = req.body;
    const users = await query('SELECT id, email, password_hash, role, status FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    if (user.status !== 'approved') {
        res.status(403).json({
            message: 'Account pending approval. Please wait for Tourism Office to approve your registration.',
            status: user.status,
        });
        return;
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
        res.status(401).json({ message: 'Invalid email or password' });
        return;
    }
    const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
    });
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });
}
export async function registerBusiness(req, res) {
    const body = req.body;
    const files = req.files;
    const permitFile = files?.permitFile?.[0];
    const validIdFile = files?.validIdFile?.[0];
    const existing = await query('SELECT id FROM users WHERE email = ?', [body.email]);
    if (existing.length > 0) {
        res.status(400).json({ message: 'Email already registered' });
        return;
    }
    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
    const userResult = await query('INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)', [body.email, passwordHash, 'business', 'pending']);
    const userId = userResult.insertId;
    const permitUrl = permitFile ? `/${config.upload.dir}/${permitFile.filename}` : null;
    const validIdUrl = validIdFile ? `/${config.upload.dir}/${validIdFile.filename}` : null;
    await query(`INSERT INTO businesses (user_id, business_name, permit_number, owner_name, address, barangay, contact_number, permit_file_url, valid_id_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        userId,
        body.businessName,
        body.permitNumber,
        body.ownerName,
        body.address,
        body.barangay ?? null,
        body.contactNumber,
        permitUrl,
        validIdUrl,
    ]);
    res.status(201).json({
        message: 'Registration submitted. Your account will be activated after Tourism Office approval.',
        status: 'pending',
    });
}
export async function forgotPassword(req, res) {
    const { email } = req.body;
    const users = await query('SELECT id FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) {
        res.json({ message: 'If the email exists, a reset link has been sent.' });
        return;
    }
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt]);
    // TODO: Send email with reset link (e.g. /reset-password?token=...)
    res.json({
        message: 'If the email exists, a reset link has been sent.',
        // Dev only: remove in production
        ...(config.nodeEnv === 'development' && { resetToken: token }),
    });
}
export async function resetPassword(req, res) {
    const { token, newPassword } = req.body;
    const tokens = await query('SELECT id, user_id, expires_at, used FROM password_reset_tokens WHERE token = ?', [token]);
    const row = tokens[0];
    if (!row || row.used || new Date() > new Date(row.expires_at)) {
        res.status(400).json({ message: 'Invalid or expired reset token' });
        return;
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, row.user_id]);
    await query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [row.id]);
    res.json({ message: 'Password updated. You can now log in.' });
}
export async function me(req, res) {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const users = await query('SELECT id, email, role, status FROM users WHERE id = ?', [req.user.userId]);
    const user = users[0];
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    let business = null;
    if (user.role === 'business') {
        const businesses = await query('SELECT id, business_name, permit_number, address, contact_number, owner_name FROM businesses WHERE user_id = ?', [user.id]);
        business = businesses[0] ?? null;
    }
    res.json({
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            business: business ?? undefined,
        },
    });
}
