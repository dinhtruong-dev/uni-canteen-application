export class Banner {
  public id: string;
  public title: string;
  public subtitle?: string;
  public imageUrl: string;
  public linkUrl?: string; // target screen / route / product
  public targetType?: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
  public targetId?: string;
  public displayOrder: number;
  public isActive: boolean;
  public startDate?: Date;
  public endDate?: Date;

  constructor(
    id: string,
    title: string,
    imageUrl: string,
    displayOrder: number = 1,
    isActive: boolean = true,
    options?: {
      subtitle?: string;
      linkUrl?: string;
      targetType?: 'PRODUCT' | 'CATEGORY' | 'EXTERNAL';
      targetId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.displayOrder = displayOrder;
    this.isActive = isActive;
    this.subtitle = options?.subtitle;
    this.linkUrl = options?.linkUrl;
    this.targetType = options?.targetType;
    this.targetId = options?.targetId;
    this.startDate = options?.startDate;
    this.endDate = options?.endDate;
  }

  public isCurrentlyActive(): boolean {
    if (!this.isActive) return false;
    const now = new Date();
    if (this.startDate && now < this.startDate) return false;
    if (this.endDate && now > this.endDate) return false;
    return true;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      subtitle: this.subtitle,
      imageUrl: this.imageUrl,
      linkUrl: this.linkUrl,
      targetType: this.targetType,
      targetId: this.targetId,
      displayOrder: this.displayOrder,
      isActive: this.isActive,
      isCurrentlyActive: this.isCurrentlyActive(),
      startDate: this.startDate?.toISOString(),
      endDate: this.endDate?.toISOString(),
    };
  }
}
