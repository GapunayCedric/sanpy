import mysql from 'mysql2/promise';
import { config } from '../config/index.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

type ExecuteValues = (string | number | null | Date | Buffer)[];
export async function query<T = unknown>(sql: string, params?: ExecuteValues): Promise<T> {
  const [rows] = await pool.execute(sql, params ?? []);
  return rows as T;
}

export { pool };
