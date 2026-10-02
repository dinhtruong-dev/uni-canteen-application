import { db } from './database.service';
import { Canteen } from '../models';

export class CanteenService {
  public getAllCanteens(): Canteen[] {
    return Array.from(db.canteens.values());
  }

  public getCanteenById(id: string): Canteen | null {
    return db.canteens.get(id) || null;
  }

  public toggleCanteenStatus(id: string): Canteen | null {
    const canteen = db.canteens.get(id);
    if (!canteen) return null;
    canteen.isOpen = !canteen.isOpen;
    db.canteens.set(id, canteen);
    return canteen;
  }
}

export const canteenService = new CanteenService();
