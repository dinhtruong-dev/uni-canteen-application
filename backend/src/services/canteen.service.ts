import { db } from './database.service';
import { Canteen } from '../models';
import { executeQuery } from '../config/db.config';
import { redisService } from './redis.service';

export class CanteenService {
  /**
   * Lấy danh sách căng tin (Canteens)
   * Cache-Aside: Redis Cache -> Miss -> Live MySQL Query -> Set Cache
   */
  public async getAllCanteens(): Promise<Canteen[]> {
    return redisService.remember('canteens:all', 300, async () => {
      try {
        const rows = await executeQuery('SELECT * FROM canteens ORDER BY name ASC');
        if (Array.isArray(rows) && rows.length > 0) {
          const list: Canteen[] = [];
          for (const row of rows) {
            const canteen = new Canteen(
              row.id,
              row.name,
              row.code,
              row.location,
              row.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
              {
                displayName: row.display_name || undefined,
                openingHours: row.opening_hours || '06:30 - 21:00',
                isOpen: row.is_open === 1 || row.is_open === true,
                rating: Number(row.rating) || 5.0,
                reviewCount: Number(row.review_count) || 0,
                soldCount: row.sold_count || '1.2K+',
                voucher: row.voucher || '120.000đ',
                freeship: row.freeship || 'Freeship KTX',
                totalTables: Number(row.total_tables) || 30,
                phone: row.phone || '0988 123 456',
                distance: row.distance || '150m',
                duration: row.duration || '10 phút',
              }
            );
            db.canteens.set(canteen.id, canteen);
            list.push(canteen);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[CanteenService] MySQL fetch notice:', err.message);
      }
      return Array.from(db.canteens.values());
    });
  }

  public async getCanteenById(id: string): Promise<Canteen | null> {
    const all = await this.getAllCanteens();
    return all.find((c) => c.id === id) || db.canteens.get(id) || null;
  }

  public async toggleCanteenStatus(id: string): Promise<Canteen | null> {
    const canteen = db.canteens.get(id);
    if (!canteen) return null;

    canteen.isOpen = !canteen.isOpen;
    db.canteens.set(id, canteen);

    try {
      await executeQuery('UPDATE canteens SET is_open = ? WHERE id = ?', [canteen.isOpen ? 1 : 0, id]);
    } catch (err: any) {
      console.warn('[CanteenService] MySQL status update notice:', err.message);
    }

    // Invalidate Cache
    await redisService.delPrefix('canteens');

    return canteen;
  }

  public async createCanteen(data: any): Promise<Canteen> {
    const id = data.id || `cant-${Date.now()}`;
    const canteen = new Canteen(
      id,
      data.name,
      data.code || `CANT-${Date.now()}`,
      data.location || 'Khuôn viên Campus',
      data.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      {
        displayName: data.displayName || data.name,
        openingHours: data.openingHours || '06:30 - 21:00',
        isOpen: data.isOpen !== false,
        rating: 5.0,
        reviewCount: 0,
        soldCount: '1.2K+',
        voucher: data.voucher || '120.000đ',
        freeship: data.freeship || 'Freeship KTX',
        totalTables: Number(data.totalTables) || 30,
        phone: data.phone || '0988 123 456',
        distance: data.distance || '150m',
        duration: data.duration || '10 phút',
      }
    );
    db.canteens.set(canteen.id, canteen);

    try {
      await executeQuery(
        `INSERT INTO canteens (id, name, display_name, code, location, distance, duration, opening_hours, is_open, rating, review_count, sold_count, voucher, freeship, image, total_tables, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), location = VALUES(location), opening_hours = VALUES(opening_hours), phone = VALUES(phone), total_tables = VALUES(total_tables)`,
        [
          canteen.id,
          canteen.name,
          canteen.displayName || canteen.name,
          canteen.code,
          canteen.location,
          canteen.distance || '150m',
          canteen.duration || '10 phút',
          canteen.openingHours || '06:30 - 21:00',
          canteen.isOpen ? 1 : 0,
          canteen.rating || 5.0,
          canteen.reviewCount || 0,
          canteen.soldCount || '1.2K+',
          canteen.voucher || '120.000đ',
          canteen.freeship || 'Freeship KTX',
          canteen.image,
          canteen.totalTables || 30,
          canteen.phone || null,
        ]
      );
    } catch (e: any) {
      console.warn('[CanteenService] MySQL create notice:', e.message);
    }

    await redisService.delPrefix('canteens');
    return canteen;
  }

  public async updateCanteen(id: string, data: any): Promise<Canteen | null> {
    const canteen = db.canteens.get(id);
    if (!canteen) return null;

    if (data.name) canteen.name = data.name;
    if (data.displayName) canteen.displayName = data.displayName;
    if (data.location) canteen.location = data.location;
    if (data.phone) canteen.phone = data.phone;
    if (data.openingHours) canteen.openingHours = data.openingHours;
    if (data.totalTables !== undefined) canteen.totalTables = Number(data.totalTables);
    if (data.image) canteen.image = data.image;
    if (data.isOpen !== undefined) canteen.isOpen = Boolean(data.isOpen);

    try {
      await executeQuery(
        `UPDATE canteens SET name = ?, display_name = ?, location = ?, phone = ?, opening_hours = ?, total_tables = ?, image = ?, is_open = ? WHERE id = ?`,
        [
          canteen.name,
          canteen.displayName || canteen.name,
          canteen.location,
          canteen.phone || null,
          canteen.openingHours || '06:30 - 21:00',
          canteen.totalTables || 30,
          canteen.image,
          canteen.isOpen ? 1 : 0,
          id,
        ]
      );
    } catch (e: any) {
      console.warn('[CanteenService] MySQL update notice:', e.message);
    }

    await redisService.delPrefix('canteens');
    return canteen;
  }

  public async deleteCanteen(id: string): Promise<boolean> {
    const exists = db.canteens.has(id);
    if (!exists) return false;
    db.canteens.delete(id);
    try {
      await executeQuery('DELETE FROM canteens WHERE id = ?', [id]);
    } catch (e: any) {
      console.warn('[CanteenService] MySQL delete notice:', e.message);
    }
    await redisService.delPrefix('canteens');
    return true;
  }
}

export const canteenService = new CanteenService();
