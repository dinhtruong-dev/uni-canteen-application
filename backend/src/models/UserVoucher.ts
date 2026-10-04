import { Voucher } from './Voucher';

export interface IUserVoucher {
  id: string;
  userId: string;
  voucherId: string;
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export class UserVoucher implements IUserVoucher {
  public id: string;
  public userId: string;
  public voucherId: string;
  public isUsed: boolean;
  public usedAt?: Date;
  public createdAt: Date;
  public voucher?: Voucher;

  constructor(
    id: string,
    userId: string,
    voucherId: string,
    options?: {
      isUsed?: boolean;
      usedAt?: Date;
      createdAt?: Date;
      voucher?: Voucher;
    }
  ) {
    this.id = id;
    this.userId = userId;
    this.voucherId = voucherId;
    this.isUsed = options?.isUsed !== undefined ? options.isUsed : false;
    this.usedAt = options?.usedAt;
    this.createdAt = options?.createdAt || new Date();
    this.voucher = options?.voucher;
  }

  public markAsUsed(): void {
    this.isUsed = true;
    this.usedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      voucherId: this.voucherId,
      isUsed: this.isUsed,
      usedAt: this.usedAt ? this.usedAt.toISOString() : undefined,
      createdAt: this.createdAt.toISOString(),
      voucher: this.voucher
        ? typeof this.voucher.toJSON === 'function'
          ? this.voucher.toJSON()
          : this.voucher
        : undefined,
    };
  }
}
