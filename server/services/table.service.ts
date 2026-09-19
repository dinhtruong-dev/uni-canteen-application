import { db } from './database.service';
import { DiningTable, TableStatus } from '../models';

export class TableService {
  public getAllTables(canteenId?: string): DiningTable[] {
    const list = Array.from(db.tables.values());
    if (canteenId) {
      return list.filter((t) => t.canteenId === canteenId);
    }
    return list;
  }

  public getTableById(tableId: string): DiningTable | undefined {
    return db.tables.get(tableId);
  }

  public findTableByQr(qrCodeData: string): DiningTable | undefined {
    return Array.from(db.tables.values()).find((t) => t.qrCode.includes(qrCodeData) || t.id === qrCodeData);
  }

  public updateTableStatus(tableId: string, status: TableStatus, orderId?: string): DiningTable | null {
    const table = db.tables.get(tableId);
    if (!table) return null;

    if (status === 'OCCUPIED' && orderId) {
      table.occupy(orderId);
    } else if (status === 'AVAILABLE') {
      table.release();
    } else {
      table.status = status;
    }
    return table;
  }
}

export const tableService = new TableService();
