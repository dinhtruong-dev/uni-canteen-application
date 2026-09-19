export class DeliveryAddress {
  public id: string;
  public userId: string;
  public recipientName: string;
  public recipientPhone: string;
  public dormBlock: string; // e.g. 'KTX A1', 'KTX B2', 'Giảng đường C'
  public roomNumber: string; // e.g. 'Phòng 402'
  public fullAddress: string;
  public notes?: string;
  public isDefault: boolean;
  public createdAt: Date;

  constructor(
    id: string,
    userId: string,
    recipientName: string,
    recipientPhone: string,
    dormBlock: string,
    roomNumber: string,
    notes?: string,
    isDefault: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.userId = userId;
    this.recipientName = recipientName;
    this.recipientPhone = recipientPhone;
    this.dormBlock = dormBlock;
    this.roomNumber = roomNumber;
    this.fullAddress = `${roomNumber}, ${dormBlock}, Ký túc xá Đại học`;
    this.notes = notes;
    this.isDefault = isDefault;
    this.createdAt = createdAt;
  }

  public setDefault(value: boolean): void {
    this.isDefault = value;
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      recipientName: this.recipientName,
      recipientPhone: this.recipientPhone,
      dormBlock: this.dormBlock,
      roomNumber: this.roomNumber,
      fullAddress: this.fullAddress,
      notes: this.notes,
      isDefault: this.isDefault,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
