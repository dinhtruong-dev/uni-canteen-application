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
}

export const userService = new UserService();
