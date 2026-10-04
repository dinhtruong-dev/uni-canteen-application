import { db } from './database.service';
import { User, DeliveryAddress, Favorite, FavoriteTargetType } from '../models';
import { executeQuery } from '../config/db.config';
import { redisService } from './redis.service';

export class UserService {
  /**
   * Lấy thông tin người dùng theo ID
   * Cache-Aside: Redis Cache -> Miss -> Live MySQL Query -> Lưu Cache
   */
  public async getUserById(userId: string): Promise<User | undefined> {
    return redisService.remember(`user:${userId}`, 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          const user = new User(r.id, r.name, r.email, r.phone, r.role, {
            studentId: r.student_id,
            faculty: r.faculty,
            department: r.department,
            walletBalance: Number(r.wallet_balance) || 0,
            avatar: r.avatar,
            status: r.status,
            passwordHash: r.password_hash,
          });
          db.users.set(user.id, user);
          return user;
        }
      } catch (err: any) {
        console.warn('[UserService] MySQL fetch user notice:', err.message);
      }
      return db.users.get(userId);
    });
  }

  /**
   * Lấy tất cả người dùng
   * Cache-Aside: Redis Cache -> Miss -> Live MySQL Query -> Lưu Cache
   */
  public async getAllUsers(): Promise<User[]> {
    return redisService.remember('users:all', 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM users ORDER BY created_at DESC');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: User[] = [];
          for (const r of rows) {
            const user = new User(r.id, r.name, r.email, r.phone, r.role, {
              studentId: r.student_id,
              faculty: r.faculty,
              department: r.department,
              walletBalance: Number(r.wallet_balance) || 0,
              avatar: r.avatar,
              status: r.status,
              passwordHash: r.password_hash,
            });
            db.users.set(user.id, user);
            list.push(user);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[UserService] MySQL fetch all users notice:', err.message);
      }
      return Array.from(db.users.values());
    });
  }

  // Delivery Addresses
  public getAddressesByUserId(userId: string): DeliveryAddress[] {
    return Array.from(db.addresses.values()).filter((a) => a.userId === userId);
  }

  public createAddress(userId: string, data: {
    recipientName: string;
    recipientPhone: string;
    dormBlock: string;
    roomNumber: string;
    notes?: string;
    isDefault?: boolean;
  }): DeliveryAddress {
    const id = `addr-${Date.now()}`;
    if (data.isDefault) {
      for (const addr of db.addresses.values()) {
        if (addr.userId === userId) addr.setDefault(false);
      }
    }

    const newAddress = new DeliveryAddress(
      id,
      userId,
      data.recipientName,
      data.recipientPhone,
      data.dormBlock,
      data.roomNumber,
      data.notes,
      data.isDefault || false
    );

    db.addresses.set(id, newAddress);

    // Persist to MySQL
    executeQuery(
      `INSERT INTO delivery_addresses (id, user_id, recipient_name, recipient_phone, dorm_block, room_number, full_address, notes, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.recipientName,
        data.recipientPhone,
        data.dormBlock,
        data.roomNumber,
        `${data.roomNumber}, ${data.dormBlock}`,
        data.notes || null,
        data.isDefault ? 1 : 0,
      ]
    ).catch((e) => console.warn('[MySQL Create Address Notice]:', e.message));

    return newAddress;
  }

  public deleteAddress(userId: string, addressId: string): boolean {
    const addr = db.addresses.get(addressId);
    if (addr && addr.userId === userId) {
      db.addresses.delete(addressId);
      executeQuery('DELETE FROM delivery_addresses WHERE id = ?', [addressId]).catch((e) =>
        console.warn('[MySQL Delete Address Notice]:', e.message)
      );
      return true;
    }
    return false;
  }

  // Favorites
  public getFavoritesByUserId(userId: string, targetType?: FavoriteTargetType): Favorite[] {
    return Array.from(db.favorites.values()).filter((f) => {
      if (f.userId !== userId) return false;
      if (targetType && f.targetType !== targetType) return false;
      return true;
    });
  }

  public toggleFavorite(userId: string, targetType: FavoriteTargetType, targetId: string): { isFavorite: boolean } {
    const existing = Array.from(db.favorites.values()).find(
      (f) => f.userId === userId && f.targetType === targetType && f.targetId === targetId
    );

    if (existing) {
      db.favorites.delete(existing.id);
      executeQuery('DELETE FROM favorites WHERE user_id = ? AND target_id = ?', [userId, targetId]).catch((e) =>
        console.warn('[MySQL Delete Favorite Notice]:', e.message)
      );
      return { isFavorite: false };
    } else {
      const newFav = new Favorite(`fav-${Date.now()}`, userId, targetType, targetId);
      db.favorites.set(newFav.id, newFav);
      executeQuery(
        'INSERT INTO favorites (id, user_id, target_type, target_id) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE target_id = target_id',
        [newFav.id, userId, targetType, targetId]
      ).catch((e) => console.warn('[MySQL Insert Favorite Notice]:', e.message));
      return { isFavorite: true };
    }
  }

  // Admin User Management
  public async updateUserRole(userId: string, role: any): Promise<User | null> {
    const user = db.users.get(userId);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();

    try {
      await executeQuery('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    } catch (e: any) {
      console.warn('[MySQL Update Role Notice]:', e.message);
    }

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
  }

  public async toggleUserStatus(userId: string): Promise<User | null> {
    const user = db.users.get(userId);
    if (!user) return null;
    user.status = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    user.isActive = user.status === 'ACTIVE';
    user.updatedAt = new Date();

    try {
      await executeQuery('UPDATE users SET status = ? WHERE id = ?', [user.status, userId]);
    } catch (e: any) {
      console.warn('[MySQL Update Status Notice]:', e.message);
    }

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
  }

  public async topUpUserWallet(userId: string, amount: number): Promise<User | null> {
    const user = db.users.get(userId);
    if (!user) return null;
    user.addFunds(amount);

    try {
      await executeQuery('UPDATE users SET wallet_balance = ? WHERE id = ?', [user.walletBalance, userId]);
    } catch (e: any) {
      console.warn('[MySQL Topup Notice]:', e.message);
    }

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
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
    const id = `user-${Date.now()}`;
    const newUser = new User(id, data.name, data.email.toLowerCase().trim(), data.phone, data.role || 'STUDENT', {
      studentId: data.studentId,
      faculty: data.faculty,
      department: data.department,
      password: data.password || '123456',
      walletBalance: 50000,
    });
    db.users.set(id, newUser);

    try {
      await executeQuery(
        `INSERT INTO users (id, student_id, name, email, password_hash, phone, role, faculty, department, wallet_balance, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUser.id,
          data.studentId || null,
          data.name,
          newUser.email,
          newUser.passwordHash,
          data.phone,
          data.role || 'STUDENT',
          data.faculty || null,
          data.department || null,
          newUser.walletBalance,
          newUser.status || 'ACTIVE',
        ]
      );
    } catch (e: any) {
      console.warn('[MySQL Create User Notice]:', e.message);
    }

    await redisService.del('users:all');
    return newUser;
  }

  public async updateUser(userId: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: any;
    studentId: string;
    faculty: string;
    department: string;
    status: any;
  }>): Promise<User | null> {
    const user = db.users.get(userId);
    if (!user) return null;
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email.toLowerCase().trim();
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.role !== undefined) user.role = data.role;
    if (data.studentId !== undefined) user.studentId = data.studentId;
    if (data.faculty !== undefined) user.faculty = data.faculty;
    if (data.department !== undefined) user.department = data.department;
    if (data.status !== undefined) {
      user.status = data.status;
      user.isActive = data.status === 'ACTIVE';
    }
    user.updatedAt = new Date();

    try {
      await executeQuery(
        `UPDATE users SET name = ?, email = ?, phone = ?, role = ?, student_id = ?, faculty = ?, department = ?, status = ?
         WHERE id = ?`,
        [
          user.name,
          user.email,
          user.phone,
          user.role,
          user.studentId || null,
          user.faculty || null,
          user.department || null,
          user.status,
          userId,
        ]
      );
    } catch (e: any) {
      console.warn('[MySQL Update User Notice]:', e.message);
    }

    await redisService.del('users:all');
    await redisService.del(`user:${userId}`);
    return user;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const deleted = db.users.delete(userId);
    if (deleted) {
      try {
        await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
      } catch (e: any) {
        console.warn('[MySQL Delete User Notice]:', e.message);
      }
      await redisService.del('users:all');
      await redisService.del(`user:${userId}`);
    }
    return deleted;
  }
}

export const userService = new UserService();
