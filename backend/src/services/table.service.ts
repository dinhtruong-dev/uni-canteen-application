import { db } from './database.service';
import { DiningTable, TableStatus } from '../models';
import { executeQuery } from '../config/db.config';
import { redisService } from './redis.service';

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
        let sql = 'SELECT * FROM dining_tables';
        const params: any[] = [];
        if (canteenId && canteenId !== 'ALL') {
          sql += ' WHERE canteen_id = ?';
          params.push(canteenId);
        }
        sql += ' ORDER BY table_number ASC';

        const rows = await executeQuery(sql, params);
        if (Array.isArray(rows) && rows.length > 0) {
          const list: DiningTable[] = [];
          for (const row of rows) {
            const rawStatus = row.status === 'EMPTY' ? 'AVAILABLE' : row.status;
            const status: TableStatus = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].includes(rawStatus)
              ? rawStatus
              : 'AVAILABLE';

            const table = new DiningTable(
              row.id,
              row.table_number || row.name || `Bàn ${row.id}`,
              row.canteen_id,
              row.canteen_name || 'Căng tin A2',
              row.qr_code || row.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(row.id)}`,
              Number(row.capacity) || 4,
              row.area || row.location_description || row.location_note || 'Khu vực chính',
              status,
              row.current_order_id || undefined,
              row.updated_at ? new Date(row.updated_at) : new Date()
            );
            db.tables.set(table.id, table);
            list.push(table);
          }
          return list;
        }
      } catch (err: any) {
        console.warn('[TableService] MySQL fetch notice:', err.message);
      }

      const list = Array.from(db.tables.values());
      if (canteenId && canteenId !== 'ALL') {
        return list.filter((t) => t.canteenId === canteenId);
      }
      return list;
    });
  }

  public async getTableById(tableId: string): Promise<DiningTable | undefined> {
    if (!tableId) return undefined;
    const clean = tableId.trim();

    try {
      const rows = await executeQuery(
        'SELECT * FROM dining_tables WHERE id = ? OR table_number = ? LIMIT 1',
        [clean, clean]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        const rawStatus = row.status === 'EMPTY' ? 'AVAILABLE' : row.status;
        const status: TableStatus = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].includes(rawStatus)
          ? rawStatus
          : 'AVAILABLE';

        const table = new DiningTable(
          row.id,
          row.table_number || row.name || `Bàn ${row.id}`,
          row.canteen_id,
          row.canteen_name || 'Căng tin A2',
          row.qr_code || row.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(row.id)}`,
          Number(row.capacity) || 4,
          row.area || row.location_description || row.location_note || 'Khu vực chính',
          status,
          row.current_order_id || undefined,
          row.updated_at ? new Date(row.updated_at) : new Date()
        );
        db.tables.set(table.id, table);
        return table;
      }
    } catch (e: any) {
      console.warn('[TableService] getTableById MySQL notice:', e.message);
    }

    const tables = await this.getAllTables();
    return (
      tables.find(
        (t) =>
          t.id.toLowerCase() === clean.toLowerCase() ||
          t.tableNumber.toLowerCase() === clean.toLowerCase() ||
          t.tableNumber.replace(/\s+/g, '').toLowerCase() === clean.replace(/\s+/g, '').toLowerCase()
      ) || db.tables.get(clean)
    );
  }

  /**
   * Quét và đối chiếu mã QR bàn ăn:
   * Hỗ trợ tìm kiếm theo ID bàn, mã QR chuỗi URL, mã số bàn (BÀN A01, TBL-01,...)
   */
  public async findTableByQr(qrCodeData: string): Promise<DiningTable | undefined> {
    if (!qrCodeData) return undefined;
    let clean = qrCodeData.trim();

    // Hỗ trợ trích xuất mã bàn nếu quét ra link URL (ví dụ https://.../?table=xxx hoặc /table/xxx)
    if (clean.includes('table=')) {
      const match = clean.match(/table=([^&]+)/);
      if (match && match[1]) clean = decodeURIComponent(match[1]).trim();
    } else if (clean.includes('/table/')) {
      const parts = clean.split('/table/');
      if (parts[1]) clean = decodeURIComponent(parts[1].split(/[?#/]/)[0]).trim();
    }

    const cleanLower = clean.toLowerCase();
    const cleanNoSpace = cleanLower.replace(/\s+/g, '');

    try {
      const rows = await executeQuery(
        `SELECT * FROM dining_tables 
         WHERE id = ? OR table_number = ? 
            OR REPLACE(LOWER(table_number), ' ', '') = ?
            OR qr_code LIKE ? 
            OR ? LIKE CONCAT('%', id, '%') 
            OR ? LIKE CONCAT('%', table_number, '%')
         LIMIT 1`,
        [clean, clean, cleanNoSpace, `%${clean}%`, clean, clean]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        const rawStatus = row.status === 'EMPTY' ? 'AVAILABLE' : row.status;
        const status: TableStatus = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'].includes(rawStatus)
          ? rawStatus
          : 'AVAILABLE';

        const table = new DiningTable(
          row.id,
          row.table_number || row.name || `Bàn ${row.id}`,
          row.canteen_id,
          row.canteen_name || 'Căng tin A2',
          row.qr_code || row.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(row.id)}`,
          Number(row.capacity) || 4,
          row.area || row.location_description || row.location_note || 'Khu vực chính',
          status,
          row.current_order_id || undefined,
          row.updated_at ? new Date(row.updated_at) : new Date()
        );
        db.tables.set(table.id, table);
        return table;
      }
    } catch (e: any) {
      console.warn('[TableService] findTableByQr MySQL notice:', e.message);
    }

    const tables = await this.getAllTables();
    return tables.find((t) => {
      const tQr = (t.qrCode || '').toLowerCase();
      const tId = (t.id || '').toLowerCase();
      const tNum = (t.tableNumber || '').toLowerCase();
      const tNumNoSpace = tNum.replace(/\s+/g, '');
      const cleanNoSpace = cleanLower.replace(/\s+/g, '');

      return (
        tQr.includes(cleanLower) ||
        cleanLower.includes(tQr) ||
        tId === cleanLower ||
        tNum === cleanLower ||
        tNumNoSpace === cleanNoSpace ||
        cleanLower.includes(tId) ||
        cleanLower.includes(tNumNoSpace)
      );
    });
  }

  /**
   * Cập nhật trạng thái bàn ăn (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
   * Lưu trực tiếp vào MySQL và xóa cache
   */
  public async updateTableStatus(
    tableId: string,
    status: TableStatus | string,
    orderId?: string
  ): Promise<DiningTable | null> {
    const normStatus: TableStatus = (status === 'EMPTY' ? 'AVAILABLE' : status) as TableStatus;
    let table = await this.getTableById(tableId);
    if (!table) return null;

    if (normStatus === 'OCCUPIED' && orderId) {
      table.occupy(orderId);
    } else if (normStatus === 'AVAILABLE') {
      table.release();
    } else {
      table.status = normStatus;
      if (orderId) table.currentOrderId = orderId;
      table.updatedAt = new Date();
    }

    try {
      await executeQuery(
        'UPDATE dining_tables SET status = ?, current_order_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR table_number = ?',
        [table.status, table.currentOrderId || null, table.id, table.tableNumber]
      );
    } catch (err: any) {
      console.warn('[TableService] MySQL update status notice:', err.message);
    }

    // Invalidate Cache
    await redisService.delPrefix('tables');

    return table;
  }

  /**
   * Tạo bàn ăn mới (Admin & Staff) và tự sinh mã QR
   */
  public async createTable(dto: CreateTableDTO): Promise<DiningTable> {
    const id = `tbl-${Date.now()}`;
    const canteenId = dto.canteenId || 'cant-a';
    const canteen = db.canteens.get(canteenId);
    const canteenName = dto.canteenName || (canteen ? canteen.name : 'Căng Tin A - Giảng Đường Trung Tâm A2');
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

    const newTable = new DiningTable(
      id,
      tableNumber,
      canteenId,
      canteenName,
      qrCode,
      capacity,
      area,
      status
    );

    db.tables.set(newTable.id, newTable);

    try {
      await executeQuery(
        `INSERT INTO dining_tables (id, table_number, canteen_id, canteen_name, qr_code, capacity, area, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE table_number = VALUES(table_number), capacity = VALUES(capacity), area = VALUES(area), status = VALUES(status)`,
        [
          newTable.id,
          newTable.tableNumber,
          newTable.canteenId,
          newTable.canteenName,
          newTable.qrCode,
          newTable.capacity,
          newTable.area,
          newTable.status,
        ]
      );
    } catch (dbErr: any) {
      console.warn('[TableService createTable MySQL notice]:', dbErr.message);
    }

    await redisService.delPrefix('tables');
    return newTable;
  }

  /**
   * Cập nhật thông tin bàn ăn
   */
  public async updateTable(id: string, dto: Partial<CreateTableDTO>): Promise<DiningTable | null> {
    const table = await this.getTableById(id);
    if (!table) return null;

    if (dto.tableNumber) table.tableNumber = dto.tableNumber.trim();
    if (dto.capacity !== undefined) table.capacity = Number(dto.capacity);
    if (dto.area) table.area = dto.area.trim();
    if (dto.status) {
      table.status = (dto.status === 'EMPTY' ? 'AVAILABLE' : dto.status) as TableStatus;
    }
    if (dto.canteenId) table.canteenId = dto.canteenId;
    table.updatedAt = new Date();

    try {
      await executeQuery(
        `UPDATE dining_tables 
         SET table_number = ?, capacity = ?, area = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ? OR table_number = ?`,
        [table.tableNumber, table.capacity, table.area, table.status, table.id, table.tableNumber]
      );
    } catch (dbErr: any) {
      console.warn('[TableService updateTable MySQL notice]:', dbErr.message);
    }

    await redisService.delPrefix('tables');
    return table;
  }

  /**
   * Xóa bàn ăn khỏi CSDL
   */
  public async deleteTable(id: string): Promise<boolean> {
    const table = await this.getTableById(id);
    if (!table) return false;

    db.tables.delete(table.id);

    try {
      await executeQuery('DELETE FROM dining_tables WHERE id = ? OR table_number = ?', [table.id, table.tableNumber]);
    } catch (dbErr: any) {
      console.warn('[TableService deleteTable MySQL notice]:', dbErr.message);
    }

    await redisService.delPrefix('tables');
    return true;
  }
}

export const tableService = new TableService();
