import { ProductOption } from './ProductOption';

export class Product {
  public id: string;
  public name: string;
  public price: number;
  public originalPrice?: number;
  public categoryId: string;
  public categoryName?: string;
  public canteenId: string;
  public canteenName?: string;
  public image: string;
  public description?: string;
  public rating: number;
  public reviewCount: number;
  public preparationTime: number; // in minutes
  public isAvailable: boolean;
  public isBestSeller?: boolean;
  public isNew?: boolean;
  public isVegetarian?: boolean;
  public soldCount: number;
  public calories?: number;
  public options: ProductOption[];
  public createdAt: Date;

  constructor(
    id: string,
    name: string,
    price: number,
    categoryId: string,
    canteenId: string,
    image: string,
    rating: number = 4.8,
    reviewCount: number = 50,
    preparationTime: number = 10,
    isAvailable: boolean = true,
    extra?: {
      originalPrice?: number;
      categoryName?: string;
      canteenName?: string;
      description?: string;
      isBestSeller?: boolean;
      isNew?: boolean;
      isVegetarian?: boolean;
      soldCount?: number;
      calories?: number;
      options?: ProductOption[];
      createdAt?: Date;
    }
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.categoryId = categoryId;
    this.canteenId = canteenId;
    this.image = image;
    this.rating = rating;
    this.reviewCount = reviewCount;
    this.preparationTime = preparationTime;
    this.isAvailable = isAvailable;

    this.originalPrice = extra?.originalPrice;
    this.categoryName = extra?.categoryName;
    this.canteenName = extra?.canteenName;
    this.description = extra?.description;
    this.isBestSeller = extra?.isBestSeller;
    this.isNew = extra?.isNew;
    this.isVegetarian = extra?.isVegetarian;
    this.soldCount = extra?.soldCount || 0;
    this.calories = extra?.calories;
    this.options = extra?.options || [];
    this.createdAt = extra?.createdAt || new Date();
  }

  public getDiscountPercent(): number {
    if (!this.originalPrice || this.originalPrice <= this.price) return 0;
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  public calculateFinalPrice(selectedOptionItemIds: string[] = []): number {
    let total = this.price;
    if (this.options && selectedOptionItemIds.length > 0) {
      for (const opt of this.options) {
        for (const item of opt.items) {
          if (selectedOptionItemIds.includes(item.id)) {
            total += item.extraPrice;
          }
        }
      }
    }
    return total;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      originalPrice: this.originalPrice,
      discountPercent: this.getDiscountPercent(),
      categoryId: this.categoryId,
      categoryName: this.categoryName,
      canteenId: this.canteenId,
      canteenName: this.canteenName,
      image: this.image,
      description: this.description,
      rating: this.rating,
      reviewCount: this.reviewCount,
      preparationTime: this.preparationTime,
      isAvailable: this.isAvailable,
      isBestSeller: this.isBestSeller,
      isNew: this.isNew,
      isVegetarian: this.isVegetarian,
      soldCount: this.soldCount,
      calories: this.calories,
      options: this.options.map((o) => o.toJSON()),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
