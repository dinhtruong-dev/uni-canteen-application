import bcrypt from 'bcryptjs';
import { literal } from 'sequelize';
import sequelize from '../db/sequelize';
import { UserRole, UserStatus } from '../types/auth.types';
import {
  User,
  DeliveryAddress,
  Favorite,
  FavoriteTargetType,
} from '../models';
import { redisService } from './redis.service';

export class UserService {

  public async getUserById(userId: string): Promise<User | undefined> {
    return redisService.remember(`user:${userId}`, 300, async () => {
      try {
        const r = await User.findByPk(userId, {
          attributes: { exclude: ['passwordHash'] },
        });
        return r || undefined;
      } catch (err: any) {
        console.error('[UserService.getUserById Error]:', err.message);
        throw err;
      }
    });
  }

  public async getAllUsers(): Promise<User[]> {
    return redisService.remember('users:all', 300, async () => {
      try {
        const rows = await User.findAll({
          attributes: { exclude: ['passwordHash'] },
          order: [['created_at', 'DESC']],
        });
        return rows || [];
      } catch (err: any) {
        console.error('[UserService.getAllUsers Error]:', err.message);
        throw err;
      }
    });
  }

  public async getAddressesByUserId(userId: string): Promise<DeliveryAddress[]> {
    try {
      const rows = await DeliveryAddress.findAll({
        where: { userId },
        order: [['is_default', 'DESC']],
      });
      return rows || [];
    } catch (err: any) {
      console.error('[UserService.getAddressesByUserId Error]:', err.message);
      throw err;
    }
  }

  public async createAddress(
    userId: string,
    data: {
      recipientName: string;
      recipientPhone: string;
      dormBlock: string;
      roomNumber: string;
      notes?: string;
      isDefault?: boolean;
    }
  ): Promise<DeliveryAddress> {
    try {
      return await sequelize.transaction(async (t) => {
        if (data.isDefault) {
          await DeliveryAddress.update(
            { isDefault: false },
            { where: { userId }, transaction: t }
          );
        }

        const newAddr = await DeliveryAddress.create(
          {
            id: `addr-${Date.now()}`,
            userId,
            recipientName: data.recipientName,
            recipientPhone: data.recipientPhone,
            dormBlock: data.dormBlock,
            roomNumber: data.roomNumber,
            fullAddress: `${data.roomNumber}, ${data.dormBlock}`,
            notes: data.notes || undefined,
            isDefault: data.isDefault || false,
          },
          { transaction: t }
        );

        return newAddr;
      });
    } catch (err: any) {
      console.error('[UserService.createAddress Error]:', err.message);
      throw err;
    }
  }

  public async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    try {
      const affected = await DeliveryAddress.destroy({
        where: { id: addressId, userId },
      });
      return affected > 0;
    } catch (err: any) {
      console.error('[UserService.deleteAddress Error]:', err.message);
      throw err;
    }
  }

  public async getFavoritesByUserId(
    userId: string,
    targetType?: FavoriteTargetType
  ): Promise<Favorite[]> {
    try {
      const whereCond: any = { userId };
      if (targetType) whereCond.targetType = targetType;

      const rows = await Favorite.findAll({ where: whereCond });
      return rows || [];
    } catch (err: any) {
      console.error('[UserService.getFavoritesByUserId Error]:', err.message);
      throw err;
    }
  }

  public async toggleFavorite(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string
  ): Promise<{ isFavorite: boolean }> {
    try {
      const existing = await Favorite.findOne({
        where: { userId, targetType, targetId },
      });

      if (existing) {
        await Favorite.destroy({ where: { id: existing.id } });
        return { isFavorite: false };
      }

      try {
        await Favorite.create({
          id: `fav-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId,
          targetType,
          targetId,
        });
        return { isFavorite: true };
      } catch (createErr: any) {
        if (createErr.name === 'SequelizeUniqueConstraintError') {
          return { isFavorite: true };
        }
        throw createErr;
      }
    } catch (err: any) {
      console.error('[UserService.toggleFavorite Error]:', err.message);
      throw err;
    }
  }


  public async updateUserRole(userId: string, role: any): Promise<User | null> {
    try {
      const [affected] = await User.update({ role }, { where: { id: userId } });
      if (!affected) return null;

      await redisService.del('users:all');
      await redisService.del(`user:${userId}`);

      return (await this.getUserById(userId)) || null;
    } catch (err: any) {
      console.error('[UserService.updateUserRole Error]:', err.message);
      throw err;
    }
  }

  public async toggleUserStatus(userId: string): Promise<User | null> {
    try {
      const current = await this.getUserById(userId);
      if (!current) return null;

      const newStatus: UserStatus =
        current.status === 'BANNED' || current.status === 'BLOCKED'
          ? 'ACTIVE'
          : 'BLOCKED';

      await User.update({ status: newStatus }, { where: { id: userId } });

      await redisService.del('users:all');
      await redisService.del(`user:${userId}`);

      return (await this.getUserById(userId)) || null;
    } catch (err: any) {
      console.error('[UserService.toggleUserStatus Error]:', err.message);
      throw err;
    }
  }

  public async topUpUserWallet(userId: string, amount: number): Promise<User | null> {
    try {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Số tiền nạp không hợp lệ');
      }

      const [affected] = await User.update(
        { walletBalance: literal(`wallet_balance + ${amount}`) as any },
        { where: { id: userId } }
      );

      if (affected === 0) return null;

      await redisService.del('users:all');
      await redisService.del(`user:${userId}`);

      return (await this.getUserById(userId)) || null;
    } catch (err: any) {
      console.error('[UserService.topUpUserWallet Error]:', err.message);
      throw err;
    }
  }

  public async createUser(data: {
    name: string;
    email: string;
    phone: string;
    role?: any;
    studentId?: string;
    faculty?: string;
    department?: string;
    password?: string;
  }): Promise<User> {
    try {
      const id = `user-${Date.now()}`;
      const passwordHash = bcrypt.hashSync(data.password || '123456', 10);

      const newUser = await User.create({
        id,
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        role: data.role || 'STUDENT',
        passwordHash,
        studentId: data.studentId,
        faculty: data.faculty,
        department: data.department,
        walletBalance: 50000,
        status: 'ACTIVE',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      });

      await redisService.del('users:all');
      return newUser;
    } catch (err: any) {
      console.error('[UserService.createUser Error]:', err.message);
      throw err;
    }
  }

  public async updateUser(
    userId: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      role: any;
      studentId: string;
      faculty: string;
      department: string;
      status: any;
    }>
  ): Promise<User | null> {
    try {
      const current = await this.getUserById(userId);
      if (!current) return null;

      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.email !== undefined)
        updatePayload.email = data.email.toLowerCase().trim();
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.role !== undefined) updatePayload.role = data.role;
      if (data.studentId !== undefined) updatePayload.studentId = data.studentId;
      if (data.faculty !== undefined) updatePayload.faculty = data.faculty;
      if (data.department !== undefined) updatePayload.department = data.department;
      if (data.status !== undefined) updatePayload.status = data.status;

      await User.update(updatePayload, { where: { id: userId } });

      await redisService.del('users:all');
      await redisService.del(`user:${userId}`);

      return (await this.getUserById(userId)) || null;
    } catch (err: any) {
      console.error('[UserService.updateUser Error]:', err.message);
      throw err;
    }
  }

  public async deleteUser(userId: string): Promise<boolean> {
    try {
      const affected = await User.destroy({ where: { id: userId } });
      const deleted = affected > 0;

      if (deleted) {
        await redisService.del('users:all');
        await redisService.del(`user:${userId}`);
      }
      return deleted;
    } catch (err: any) {
      console.error('[UserService.deleteUser Error]:', err.message);
      throw err;
    }
  }
}

export const userService = new UserService();