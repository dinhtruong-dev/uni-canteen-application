import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unieat_campus_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;
let isConnected = false;

try {
  pool = mysql.createPool(dbConfig);
} catch (err) {
  console.warn('[Database Pool Initialization Notice]:', err);
}

export { pool };

export async function testDbConnection(): Promise<boolean> {
  if (!pool) return false;
  try {
    const conn = await pool.getConnection();
    console.log(`[Database] Đã kết nối thành công tới MySQL -> Host: ${dbConfig.host}:${dbConfig.port} | Database: ${dbConfig.database}`);
    conn.release();
    isConnected = true;
    return true;
  } catch (error: any) {
    console.warn(`[Database Notice] Không thể kết nối trực tiếp MySQL (${error.message || error}). Hệ thống tự động sử dụng In-Memory Cache làm bộ đệm an toàn.`);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function executeQuery(sql: string, params: any[] = []): Promise<any> {
  if (!pool) return null;
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err: any) {
    console.warn('[Database executeQuery Notice]:', err.message);
    return null;
  }
}

