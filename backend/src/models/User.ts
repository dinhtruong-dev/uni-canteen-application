import bcrypt from 'bcryptjs';

export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  status?: UserStatus;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  public id: string;
  public name: string;
  public email: string;
  public passwordHash: string;
  public phone: string;
  public role: UserRole;
  public avatar: string;
  public studentId?: string;
  public faculty?: string;
  public department?: string;
  public walletBalance: number;
  public status: UserStatus;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    phone: string,
    role: UserRole = 'STUDENT',
    options?: {
      password?: string;
      passwordHash?: string;
      avatar?: string;
      studentId?: string;
      faculty?: string;
      department?: string;
      walletBalance?: number;
      status?: UserStatus;
      isActive?: boolean;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.avatar =
      options?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    this.studentId = options?.studentId;
    this.faculty = options?.faculty;
    this.department = options?.department;
    this.walletBalance = options?.walletBalance || 0;
    this.status = options?.status || (options?.isActive === false ? 'BANNED' : 'ACTIVE');
    this.isActive = this.status === 'ACTIVE';
    this.createdAt = options?.createdAt || new Date();
    this.updatedAt = options?.updatedAt || new Date();

    if (options?.passwordHash) {
      this.passwordHash = options.passwordHash;
    } else if (options?.password) {
      this.passwordHash = bcrypt.hashSync(options.password, 10);
    } else {
      // Default hashed password for '123456'
      this.passwordHash = bcrypt.hashSync('123456', 10);
    }
  }

  public verifyPassword(password: string): boolean {
    try {
      if (bcrypt.compareSync(password, this.passwordHash)) {
        return true;
      }
    } catch {}
    // Hỗ trợ mật khẩu demo 123456 hoặc so khớp trực tiếp chuỗi hash/password mẫu
    return password === '123456' || password === this.passwordHash;
  }

  public setPassword(newPassword: string): void {
    this.passwordHash = bcrypt.hashSync(newPassword, 10);
    this.updatedAt = new Date();
  }

  public addFunds(amount: number): number {
    if (amount <= 0) throw new Error('Số tiền nạp phải lớn hơn 0');
    this.walletBalance += amount;
    this.updatedAt = new Date();
    return this.walletBalance;
  }

  public deductFunds(amount: number): boolean {
    if (amount <= 0) throw new Error('Số tiền thanh toán không hợp lệ');
    if (this.walletBalance < amount) return false;
    this.walletBalance -= amount;
    this.updatedAt = new Date();
    return true;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      avatar: this.avatar,
      studentId: this.studentId,
      faculty: this.faculty,
      department: this.department,
      walletBalance: this.walletBalance,
      status: this.status,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
