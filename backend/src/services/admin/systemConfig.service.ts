import { redisService } from '../infrastructure/redis.service';

export interface SystemConfig {
  maintenanceMode: boolean;
  deliveryFee: number;
  serviceFee: number;
  openHour: string;
  closeHour: string;
  allowGuestOrder: boolean;
  announcementText?: string;
}

const DEFAULT_CONFIG: SystemConfig = {
  maintenanceMode: false,
  deliveryFee: 15000,
  serviceFee: 2000,
  openHour: '06:30',
  closeHour: '21:30',
  allowGuestOrder: true,
  announcementText: 'Chào mừng bạn đến với hệ thống đặt đồ ăn UniEat Campus!',
};

const SYSTEM_CONFIG_KEY = 'system:config';

export class SystemConfigService {
  public async getConfig(): Promise<SystemConfig> {
    const cached = await redisService.get<SystemConfig>(SYSTEM_CONFIG_KEY);
    if (cached) return cached;
    return DEFAULT_CONFIG;
  }

  public async updateConfig(partial: Partial<SystemConfig>): Promise<SystemConfig> {
    const current = await this.getConfig();
    const updated = { ...current, ...partial };
    await redisService.set(SYSTEM_CONFIG_KEY, updated, 86400 * 30);
    return updated;
  }
}

export const systemConfigService = new SystemConfigService();
