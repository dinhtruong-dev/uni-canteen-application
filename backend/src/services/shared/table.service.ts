import { Op, Transaction } from 'sequelize';
import { DiningTable, TableStatus, Canteen } from '../../models';
import { redisService } from '../infrastructure/redis.service';

export interface CreateTableDTO {
  tableNumber: string;
  canteenId?: string;
  canteenName?: string;
  capacity?: number;
  area?: string;
  qrCode?: string;
  status?: TableStatus | string;
}

export class TableService {
  /**
   * Lấy danh sách bàn ăn (Dining Tables) từ MySQL CSDL
   * Cache-Aside: Redis Cache -> Miss -> Live MySQL Query -> Lưu Cache
   */
  public async getAllTables(canteenId?: string): Promise<DiningTable[]> {
    const cacheKey = `tables:${canteenId || 'all'}`;
    return redisService.remember(cacheKey, 60, async () => {
      try {
        const whereClause: any = {};
        if (canteenId && canteenId !== 'ALL') {
          whereClause.canteenId = canteenId;
        }

        const rows = await DiningTable.findAll({
          where: whereClause,
          order: [['tableNumber', 'ASC']],
        });
        return rows || [];
      } catch (err: any) {
        console.error('[TableService.getAllTables Error]:', err.message);
        throw err;
      }
    });
  }

  public async getTableById(tableId: string): Promise<DiningTable | undefined> {
    if (!tableId) return undefined;
    const clean = tableId.trim();

    try {
      const row = await DiningTable.findOne({
        where: {
          [Op.or]: [{ id: clean }, { tableNumber: clean }],
        },
      });
      return row || undefined;
    } catch (e: any) {
      console.error('[TableService.getTableById Error]:', e.message);
      throw e;
    }
  }

  public async findTableByQr(qrCodeData: string): Promise<DiningTable | undefined> {
    if (!qrCodeData) return undefined;
    let clean = qrCodeData.trim();

    if (clean.includes('table=')) {
      const match = clean.match(/table=([^&]+)/);
      if (match && match[1]) clean = decodeURIComponent(match[1]).trim();
    } else if (clean.includes('/table/')) {
      const parts = clean.split('/table/');
      if (parts[1]) clean = decodeURIComponent(parts[1].split(/[?#/]/)[0]).trim();
    }

    try {
      const row = await DiningTable.findOne({
        where: {
          [Op.or]: [
            { id: clean },
            { tableNumber: clean },
            { qrCode: { [Op.like]: `%${clean}%` } },
          ],
        },
      });

      return row || undefined;
    } catch (e: any) {
      console.error('[TableService.findTableByQr Error]:', e.message);
      throw e;
    }
  }

  public async updateTableStatus(
    tableId: string,
    status: TableStatus | string,
    orderId?: string,
    transaction?: Transaction
  ): Promise<DiningTable | null> {
    const normStatus: TableStatus = (status === 'EMPTY' ? 'AVAILABLE' : status) as TableStatus;
    const table = await this.getTableById(tableId);
    if (!table) return null;

    table.status = normStatus;
    if (normStatus === 'OCCUPIED' && orderId) {
      table.currentOrderId = orderId;
    } else if (normStatus === 'AVAILABLE') {
      table.currentOrderId = undefined;
    } else if (orderId) {
      table.currentOrderId = orderId;
    }

    try {
      await table.save({ transaction });
    } catch (err: any) {
      console.error('[TableService.updateTableStatus Error]:', err.message);
      throw err;
    }

    await redisService.delPrefix('tables');
    return table;
  }

  public async createTable(dto: CreateTableDTO): Promise<DiningTable> {
    try {
      const id = `tbl-${Date.now()}`;
      const canteenId = dto.canteenId || 'cant-a';
      let canteenName = dto.canteenName || 'Căng Tin A2';

      const canteen = await Canteen.findByPk(canteenId);
      if (canteen) {
        canteenName = canteen.name;
      }

      const tableNumber = dto.tableNumber.trim();
      const cleanNumber = tableNumber.replace(/\s+/g, '_').toUpperCase();
      const qrData = `UNIEAT_TABLE_${canteenId.toUpperCase()}_${cleanNumber}`;
      const qrCode =
        dto.qrCode ||
        `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
      const capacity = Number(dto.capacity) || 4;
      const area = dto.area || 'Khu vực chính';
      const rawStatus = dto.status === 'EMPTY' ? 'AVAILABLE' : dto.status;
      const status: TableStatus = (rawStatus as TableStatus) || 'AVAILABLE';

      const newTable = await DiningTable.create({
        id,
        tableNumber,
        canteenId,
        canteenName,
        qrCode,
        capacity,
        area,
        status,
      });

      await redisService.delPrefix('tables');
      return newTable;
    } catch (err: any) {
      console.error('[TableService.createTable Error]:', err.message);
      throw err;
    }
  }

  public async updateTable(id: string, dto: Partial<CreateTableDTO>): Promise<DiningTable | null> {
    try {
      const table = await this.getTableById(id);
      if (!table) return null;

      if (dto.tableNumber) table.tableNumber = dto.tableNumber.trim();
      if (dto.capacity !== undefined) table.capacity = Number(dto.capacity);
      if (dto.area) table.area = dto.area.trim();
      if (dto.status) {
        table.status = (dto.status === 'EMPTY' ? 'AVAILABLE' : dto.status) as TableStatus;
      }
      if (dto.canteenId) table.canteenId = dto.canteenId;

      await table.save();

      await redisService.delPrefix('tables');
      return table;
    } catch (err: any) {
      console.error('[TableService.updateTable Error]:', err.message);
      throw err;
    }
  }

  public async deleteTable(id: string): Promise<boolean> {
    try {
      const table = await this.getTableById(id);
      if (!table) return false;

      await table.destroy();

      await redisService.delPrefix('tables');
      return true;
    } catch (err: any) {
      console.error('[TableService.deleteTable Error]:', err.message);
      throw err;
    }
  }
}

export const tableService = new TableService();
