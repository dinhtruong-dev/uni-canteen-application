import jwt from 'jsonwebtoken';
import { db } from './database.service';
import { User, UserRole } from '../models';

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

  public register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role?: UserRole;
    studentId?: string;
    faculty?: string;
  }): { user: User; token: string } {
    // Check if email already exists
    const existing = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existing) {
      throw new Error('Email này đã được đăng ký trong hệ thống căng tin');
    }

    const userId = `user-${Date.now()}`;
    const newUser = new User(
      userId,
      data.name,
      data.email.toLowerCase(),
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
    const token = this.generateToken(newUser);

    return { user: newUser, token };
  }

  public login(email: string, password: string): { user: User; token: string } {
    const user = Array.from(db.users.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

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
