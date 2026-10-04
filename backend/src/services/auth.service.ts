import jwt from 'jsonwebtoken';
import { db } from './database.service';
import { User, UserRole } from '../models';
import { executeQuery } from '../config/db.config';

const JWT_SECRET = process.env.JWT_SECRET || 'unieat-campus-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export class AuthService {
  public generateToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  public verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  public async register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: UserRole;
    studentId?: string;
    faculty?: string;
  }): Promise<{ user: User; token: string }> {
    const cleanEmail = data.email.toLowerCase().trim();

    // Check if email already exists in RAM or MySQL
    let existing = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!existing) {
      try {
        const rows = await executeQuery('SELECT id FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
        if (Array.isArray(rows) && rows.length > 0) {
          existing = rows[0] as any;
        }
      } catch (err: any) {
        console.warn('[MySQL Check Email Notice]:', err.message);
      }
    }

    if (existing) {
      throw new Error('Email này đã được đăng ký trong hệ thống căng tin');
    }

    const userId = `user-${Date.now()}`;
    const newUser = new User(
      userId,
      data.name,
      cleanEmail,
      data.phone,
      data.role || 'STUDENT',
      {
        password: data.password,
        studentId: data.studentId,
        faculty: data.faculty,
        walletBalance: 50000, // Tặng 50.000đ khi tạo tài khoản
      }
    );

    db.users.set(newUser.id, newUser);

    // Persist to MySQL with correctly hashed password
    try {
      await executeQuery(
        `INSERT INTO users (
          id, student_id, name, email, password_hash, phone, role, faculty, wallet_balance, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), wallet_balance = VALUES(wallet_balance)`,
        [
          newUser.id,
          data.studentId || null,
          data.name,
          cleanEmail,
          newUser.passwordHash,
          data.phone,
          data.role || 'STUDENT',
          data.faculty || null,
          newUser.walletBalance,
          newUser.status || 'ACTIVE',
        ]
      );
      console.log(`[Database User Saved] ✅ ĐÃ LƯU THÀNH CÔNG VÀO MYSQL -> Email: ${cleanEmail} (ID: ${newUser.id})`);
    } catch (err: any) {
      console.error('❌ [MySQL User Persistence Error]:', err.message);
    }

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.toLowerCase().trim();

    let user = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    // If not found in RAM, fetch directly from MySQL
    if (!user) {
      try {
        const rows = await executeQuery('SELECT * FROM users WHERE email = ? LIMIT 1', [cleanEmail]);
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0];
          user = new User(
            row.id,
            row.name,
            row.email,
            row.phone,
            row.role || 'STUDENT',
            {
              passwordHash: row.password_hash,
              studentId: row.student_id,
              faculty: row.faculty,
              department: row.department,
              walletBalance: Number(row.wallet_balance) || 0,
              avatar: row.avatar,
              status: row.status,
            }
          );
          db.users.set(user.id, user);
        }
      } catch (err: any) {
        console.warn('[MySQL User Fetch Notice]:', err.message);
      }
    }

    if (!user) {
      throw new Error('Tài khoản email không tồn tại trong hệ thống');
    }

    if (!user.verifyPassword(password)) {
      throw new Error('Mật khẩu không chính xác');
    }

    const token = this.generateToken(user);
    return { user, token };
  }
}

export const authService = new AuthService();
