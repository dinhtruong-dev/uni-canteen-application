export type PickupSlotStatus = 'AVAILABLE' | 'FULL' | 'DISABLED';

export class PickupSlot {
  public id: string;
  public canteenId: string;
  public timeRange: string; // e.g. "11:00 - 11:15", "11:15 - 11:30"
  public maxOrders: number;
  public currentOrders: number;
  public status: PickupSlotStatus;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    canteenId: string,
    timeRange: string,
    maxOrders: number = 20,
    currentOrders: number = 0,
    status: PickupSlotStatus = 'AVAILABLE',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.canteenId = canteenId;
    this.timeRange = timeRange;
    this.maxOrders = maxOrders;
    this.currentOrders = currentOrders;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public incrementOrders(): boolean {
    if (this.currentOrders >= this.maxOrders || this.status !== 'AVAILABLE') {
      this.status = 'FULL';
      return false;
    }
    this.currentOrders += 1;
    if (this.currentOrders >= this.maxOrders) {
      this.status = 'FULL';
    }
    this.updatedAt = new Date();
    return true;
  }

  public decrementOrders(): void {
    if (this.currentOrders > 0) {
      this.currentOrders -= 1;
    }
    if (this.currentOrders < this.maxOrders && this.status === 'FULL') {
      this.status = 'AVAILABLE';
    }
    this.updatedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      canteenId: this.canteenId,
      timeRange: this.timeRange,
      maxOrders: this.maxOrders,
      currentOrders: this.currentOrders,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
