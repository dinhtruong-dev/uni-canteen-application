import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import { User } from '../../models';
import { redisService } from '../infrastructure/redis.service';
import type { UserRole, UserStatus } from '../../types/auth.types';

export class UserManagementService {
  public async getUsers(params: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    const offset = (page - 1) * limit;

    const where: any = {};
    if (params.role && params.role !== 'ALL') where.role = params.role;
    if (params.status && params.status !== 'ALL') where.status = params.status;
    if (params.search) {
      const q = `%${params.search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { name: { [Op.like]: q } },
        { email: { [Op.like]: q } },
        { phone: { [Op.like]: q } },
        { studentId: { [Op.like]: q } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit) || 1,
      data: rows,
    };
  }

  public async updateUserRole(userId: string, role: UserRole): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.role = role;
    await user.save();

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
  }

  public async toggleUserStatus(userId: string): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    user.status = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    await user.save();

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
  }

  public async createStaffUser(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    department?: string;
  }): Promise<User> {
    const id = `user-staff-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(data.password || '123456', 10);

    const newUser = await User.create({
      id,
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: data.phone,
      role: 'STAFF',
      passwordHash,
      department: data.department || 'Tổ Quản Trị Căn Tin',
      status: 'ACTIVE',
      walletBalance: 0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    });

    await redisService.del('users:all');
    return newUser;
  }
}

export const userManagementService = new UserManagementService();
