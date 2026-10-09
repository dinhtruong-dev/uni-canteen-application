import { Canteen } from '../models';
import { redisService } from './redis.service';

export class CanteenService {

  public async getAllCanteens(): Promise<Canteen[]> {
    return redisService.remember('canteens:all', 300, async () => {
      try {
        const rows = await Canteen.findAll({ order: [['name', 'ASC']] });
        return rows || [];
      } catch (err: any) {
        console.error('[CanteenService.getAllCanteens Error]:', err.message);
        throw err;
      }
    });
  }

  public async getCanteenById(id: string): Promise<Canteen | null> {
    try {
      const row = await Canteen.findByPk(id);
      return row || null;
    } catch (err: any) {
      console.error('[CanteenService.getCanteenById Error]:', err.message);
      throw err;
    }
  }

  public async toggleCanteenStatus(id: string): Promise<Canteen | null> {
    try {
      const current = await this.getCanteenById(id);
      if (!current) return null;

      const newIsOpen = !current.isOpen;
      await Canteen.update({ isOpen: newIsOpen }, { where: { id } });

      await redisService.delPrefix('canteens');
      return this.getCanteenById(id);
    } catch (err: any) {
      console.error('[CanteenService.toggleCanteenStatus Error]:', err.message);
      throw err;
    }
  }

  public async createCanteen(data: any): Promise<Canteen> {
    try {
      const id = data.id || `cant-${Date.now()}`;
      const canteen = await Canteen.create({
        id,
        name: data.name,
        code: data.code || `CANT-${Date.now()}`,
        location: data.location || 'Khuôn viên Campus',
        image: data.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
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
      });

      await redisService.delPrefix('canteens');
      return canteen;
    } catch (err: any) {
      console.error('[CanteenService.createCanteen Error]:', err.message);
      throw err;
    }
  }

  public async updateCanteen(id: string, data: any): Promise<Canteen | null> {
    try {
      const current = await this.getCanteenById(id);
      if (!current) return null;

      const updatePayload: Record<string, any> = {};

      if (data.name) updatePayload.name = data.name;
      if (data.displayName || data.name) updatePayload.displayName = data.displayName || data.name;
      if (data.location) updatePayload.location = data.location;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.openingHours) updatePayload.openingHours = data.openingHours;
      if (data.totalTables !== undefined) updatePayload.totalTables = Number(data.totalTables);
      if (data.image) updatePayload.image = data.image;
      if (data.isOpen !== undefined) updatePayload.isOpen = Boolean(data.isOpen);

      await Canteen.update(updatePayload, { where: { id } });

      await redisService.delPrefix('canteens');
      return this.getCanteenById(id);
    } catch (err: any) {
      console.error('[CanteenService.updateCanteen Error]:', err.message);
      throw err;
    }
  }

  public async deleteCanteen(id: string): Promise<boolean> {
    try {
      const affectedCount = await Canteen.destroy({ where: { id } });
      const deleted = affectedCount > 0;
      if (deleted) {
        await redisService.delPrefix('canteens');
      }
      return deleted;
    } catch (err: any) {
      console.error('[CanteenService.deleteCanteen Error]:', err.message);
      throw err;
    }
  }
}

export const canteenService = new CanteenService();
