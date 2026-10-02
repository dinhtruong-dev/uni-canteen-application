import { db } from './database.service';
import { User, DeliveryAddress, Favorite, FavoriteTargetType } from '../models';

export class UserService {
  public getUserById(userId: string): User | undefined {
    return db.users.get(userId);
  }

  public getAllUsers(): User[] {
    return Array.from(db.users.values());
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
      // unset existing default
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
    return newAddress;
  }

  public deleteAddress(userId: string, addressId: string): boolean {
    const addr = db.addresses.get(addressId);
    if (addr && addr.userId === userId) {
      db.addresses.delete(addressId);
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
      return { isFavorite: false };
    } else {
      const newFav = new Favorite(`fav-${Date.now()}`, userId, targetType, targetId);
      db.favorites.set(newFav.id, newFav);
      return { isFavorite: true };
    }
  }

  // Admin User Management
  public updateUserRole(userId: string, role: any): User | null {
    const user = db.users.get(userId);
    if (!user) return null;
    user.role = role;
    user.updatedAt = new Date();
    return user;
  }

  public toggleUserStatus(userId: string): User | null {
    const user = db.users.get(userId);
    if (!user) return null;
    user.status = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    user.isActive = user.status === 'ACTIVE';
    user.updatedAt = new Date();
    return user;
  }

  public topUpUserWallet(userId: string, amount: number): User | null {
    const user = db.users.get(userId);
    if (!user) return null;
    user.addFunds(amount);
    return user;
  }

  public createUser(data: {
    name: string;
    email: string;
    phone: string;
    role?: any;
    studentId?: string;
    faculty?: string;
    department?: string;
    password?: string;
  }): User {
    const id = `user-${Date.now()}`;
    const newUser = new User(id, data.name, data.email, data.phone, data.role || 'STUDENT', {
      studentId: data.studentId,
      faculty: data.faculty,
      department: data.department,
      password: data.password || '123456',
      walletBalance: 50000,
    });
    db.users.set(id, newUser);
    return newUser;
  }

  public updateUser(userId: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: any;
    studentId: string;
    faculty: string;
    department: string;
    status: any;
  }>): User | null {
    const user = db.users.get(userId);
    if (!user) return null;
    if (data.name !== undefined) user.name = data.name;
    if (data.email !== undefined) user.email = data.email;
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
    return user;
  }

  public deleteUser(userId: string): boolean {
    return db.users.delete(userId);
  }
}

export const userService = new UserService();
