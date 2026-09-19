export class FlashSale {
  public id: string;
  public title: string;
  public description?: string;
  public productId: string;
  public productName: string;
  public productImage: string;
  public originalPrice: number;
  public salePrice: number;
  public discountPercent: number;
  public totalSlots: number;
  public soldSlots: number;
  public startTime: Date;
  public endTime: Date;
  public isActive: boolean;

  constructor(
    id: string,
    title: string,
    productId: string,
    productName: string,
    productImage: string,
    originalPrice: number,
    salePrice: number,
    totalSlots: number,
    soldSlots: number = 0,
    startTime: Date = new Date(),
    endTime: Date = new Date(Date.now() + 4 * 3600 * 1000),
    isActive: boolean = true,
    description?: string
  ) {
    this.id = id;
    this.title = title;
    this.productId = productId;
    this.productName = productName;
    this.productImage = productImage;
    this.originalPrice = originalPrice;
    this.salePrice = salePrice;
    this.discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    this.totalSlots = totalSlots;
    this.soldSlots = soldSlots;
    this.startTime = startTime;
    this.endTime = endTime;
    this.isActive = isActive;
    this.description = description;
  }

  public isOngoing(): boolean {
    if (!this.isActive) return false;
    const now = new Date();
    return now >= this.startTime && now <= this.endTime && this.soldSlots < this.totalSlots;
  }

  public getRemainingSlots(): number {
    return Math.max(0, this.totalSlots - this.soldSlots);
  }

  public claimSlot(): boolean {
    if (!this.isOngoing()) return false;
    this.soldSlots += 1;
    return true;
  }

  public toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      productId: this.productId,
      productName: this.productName,
      productImage: this.productImage,
      originalPrice: this.originalPrice,
      salePrice: this.salePrice,
      discountPercent: this.discountPercent,
      totalSlots: this.totalSlots,
      soldSlots: this.soldSlots,
      remainingSlots: this.getRemainingSlots(),
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      isOngoing: this.isOngoing(),
      isActive: this.isActive,
    };
  }
}
