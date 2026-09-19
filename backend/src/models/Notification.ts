export type NotificationType = 'ORDER_STATUS' | 'SYSTEM' | 'PROMOTION' | 'WALLET';

export class Notification {
  public id: string;
  public userId: string; // 'ALL' for system broadcast or specific userId
  public title: string;
  public message: string;
  public type: NotificationType;
  public referenceId?: string; // e.g. orderId, voucherCode
  public isRead: boolean;
  public createdAt: Date;

  constructor(
    id: string,
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
    referenceId?: string,
    isRead: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.message = message;
    this.type = type;
    this.referenceId = referenceId;
    this.isRead = isRead;
    this.createdAt = createdAt;
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      title: this.title,
      message: this.message,
      type: this.type,
      referenceId: this.referenceId,
      isRead: this.isRead,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
