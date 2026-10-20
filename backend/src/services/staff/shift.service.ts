import { redisService } from '../infrastructure/redis.service';

export interface StaffShiftRecord {
  id: string;
  staffId: string;
  staffName: string;
  canteenId: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
  checkInAt: string;
  checkOutAt?: string;
  status: 'CHECKED_IN' | 'COMPLETED' | 'ABSENT';
  hoursWorked?: number;
  notes?: string;
}

export class ShiftService {
  private getShiftKey(staffId: string, dateStr: string): string {
    return `shift:${staffId}:${dateStr}`;
  }

  public async checkIn(params: {
    staffId: string;
    staffName: string;
    canteenId?: string;
    shiftType?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_DAY';
    notes?: string;
  }): Promise<StaffShiftRecord> {
    const today = new Date().toISOString().split('T')[0];
    const key = this.getShiftKey(params.staffId, today);

    const existing = await redisService.get<StaffShiftRecord>(key);
    if (existing && existing.status === 'CHECKED_IN') {
      return existing;
    }

    const shift: StaffShiftRecord = {
      id: `shift-${Date.now()}`,
      staffId: params.staffId,
      staffName: params.staffName,
      canteenId: params.canteenId || 'cant-a',
      shiftType: params.shiftType || 'MORNING',
      checkInAt: new Date().toISOString(),
      status: 'CHECKED_IN',
      notes: params.notes,
    };

    await redisService.set(key, shift, 86400 * 7);
    return shift;
  }

  public async checkOut(params: {
    staffId: string;
    notes?: string;
  }): Promise<StaffShiftRecord | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = this.getShiftKey(params.staffId, today);

    const shift = await redisService.get<StaffShiftRecord>(key);
    if (!shift) return null;

    const checkOutDate = new Date();
    const checkInDate = new Date(shift.checkInAt);
    const diffMs = checkOutDate.getTime() - checkInDate.getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;

    shift.checkOutAt = checkOutDate.toISOString();
    shift.status = 'COMPLETED';
    shift.hoursWorked = Math.max(0.5, hours);
    if (params.notes) shift.notes = params.notes;

    await redisService.set(key, shift, 86400 * 7);
    return shift;
  }

  public async getStaffShifts(staffId: string): Promise<StaffShiftRecord[]> {
    const keys = await redisService.keys(`shift:${staffId}:*`);
    const results: StaffShiftRecord[] = [];
    for (const k of keys) {
      const s = await redisService.get<StaffShiftRecord>(k);
      if (s) results.push(s);
    }
    return results.sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime());
  }
}

export const shiftService = new ShiftService();
