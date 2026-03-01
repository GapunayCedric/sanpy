/**
 * Seed the first admin user for XAMPP/local development.
 * Run from backend folder: node scripts/seed-admin.js
 * Default login: admin@sanpy.local / Admin@123
 */
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sanpy.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sanpy_tourism',
  });

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND role = ?',
      [ADMIN_EMAIL, 'admin']
    );
    if (existing.length > 0) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      process.exit(0);
      return;
    }
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await pool.execute(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)',
      [ADMIN_EMAIL, hash, 'admin', 'approved']
    );
    console.log('Admin user created successfully!');
    console.log('  Email:', ADMIN_EMAIL);
    console.log('  Password:', ADMIN_PASSWORD);
    console.log('  Login at http://localhost:3000/login');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
