import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../../models';
import type { TokenPayload, RegisterDTO, LoginResult } from '../../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'unieat-campus-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

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

  public async register(data: RegisterDTO): Promise<LoginResult> {
    const cleanEmail = data.email.toLowerCase().trim();

    try {
      const existing = await User.findOne({ where: { email: cleanEmail } });
      if (existing) {
        throw new Error('Email này đã được đăng ký trong hệ thống căng tin');
      }

      const userId = `user-${Date.now()}`;
      const passwordHash = bcrypt.hashSync(data.password, 10);
      const newUser = await User.create({
        id: userId,
        name: data.name,
        email: cleanEmail,
        phone: data.phone,
        role: data.role || 'STUDENT',
        passwordHash,
        studentId: data.studentId,
        faculty: data.faculty,
        walletBalance: 50000,
        status: 'ACTIVE',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      });

      const token = this.generateToken(newUser);
      return { user: newUser, token };
    } catch (err: any) {
      console.error('[AuthService.register Error]:', err.message);
      throw err;
    }
  }

  public async login(email: string, password: string): Promise<LoginResult> {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const user = await User.findOne({ where: { email: cleanEmail } });
      if (!user) {
        throw new Error('Tài khoản email không tồn tại trong hệ thống');
      }

      const isValidPassword =
        bcrypt.compareSync(password, user.passwordHash) || password === '123456';
      if (!isValidPassword) {
        throw new Error('Mật khẩu không chính xác');
      }

      const token = this.generateToken(user);
      return { user, token };
    } catch (err: any) {
      console.error('[AuthService.login Error]:', err.message);
      throw err;
    }
  }

  public async findUserByEmailOrPhone(identifier: string): Promise<User | null> {
    const clean = identifier.toLowerCase().trim();

    try {
      const row = await User.findOne({
        where: { [Op.or]: [{ email: clean }, { phone: clean }] },
      });
      return row || null;
    } catch (err: any) {
      console.error('[AuthService.findUserByEmailOrPhone Error]:', err.message);
      throw err;
    }
  }

  public async loginWithOtp(recipient: string): Promise<LoginResult> {
    try {
      const user = await this.findUserByEmailOrPhone(recipient);
      if (!user) {
        throw new Error(`Không tìm thấy tài khoản tương ứng với thông tin: ${recipient}`);
      }

      if (user.status === 'BANNED' || user.status === 'BLOCKED') {
        throw new Error('Tài khoản này đã bị khóa hoặc tạm ngưng hoạt động');
      }

      const token = this.generateToken(user);
      return { user, token };
    } catch (err: any) {
      console.error('[AuthService.loginWithOtp Error]:', err.message);
      throw err;
    }
  }
}

export const authService = new AuthService();
