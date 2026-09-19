export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export class DiningTable {
  public id: string;
  public tableNumber: string; // e.g. 'Bàn 01', 'Bàn 12'
  public canteenId: string;
  public canteenName: string;
  public qrCode: string; // URL or QR string for table ordering
  public capacity: number; // số ghế
  public area: string; // e.g. 'Tầng 1 - Sân trước', 'Tầng 2 - Máy lạnh'
  public status: TableStatus;
  public currentOrderId?: string;
  public updatedAt: Date;

  constructor(
    id: string,
    tableNumber: string,
    canteenId: string,
    canteenName: string,
    qrCode: string,
    capacity: number = 4,
    area: string = 'Khu vực chính',
    status: TableStatus = 'AVAILABLE',
    currentOrderId?: string,
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.tableNumber = tableNumber;
    this.canteenId = canteenId;
    this.canteenName = canteenName;
    this.qrCode = qrCode;
    this.capacity = capacity;
    this.area = area;
    this.status = status;
    this.currentOrderId = currentOrderId;
    this.updatedAt = updatedAt;
  }

  public occupy(orderId: string): void {
    this.status = 'OCCUPIED';
    this.currentOrderId = orderId;
    this.updatedAt = new Date();
  }

  public release(): void {
    this.status = 'AVAILABLE';
    this.currentOrderId = undefined;
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      tableNumber: this.tableNumber,
      canteenId: this.canteenId,
      canteenName: this.canteenName,
      qrCode: this.qrCode,
      capacity: this.capacity,
      area: this.area,
      status: this.status,
      currentOrderId: this.currentOrderId,
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
