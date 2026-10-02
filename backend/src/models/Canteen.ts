export class Canteen {
  public id: string;
  public name: string;
  public displayName: string;
  public code: string;
  public location: string;
  public distance?: string;
  public duration?: string;
  public openingHours?: string;
  public isOpen: boolean;
  public rating: number;
  public reviewCount: number;
  public soldCount?: string;
  public voucher?: string;
  public freeship?: string;
  public image: string;
  public totalTables: number;
  public phone?: string;

  constructor(
    id: string,
    name: string,
    code: string,
    location: string,
    image: string,
    options?: {
      displayName?: string;
      distance?: string;
      duration?: string;
      openingHours?: string;
      isOpen?: boolean;
      rating?: number;
      reviewCount?: number;
      soldCount?: string;
      voucher?: string;
      freeship?: string;
      totalTables?: number;
      phone?: string;
    }
  ) {
    this.id = id;
    this.name = name;
    this.displayName = options?.displayName || name;
    this.code = code;
    this.location = location;
    this.image = image;
    this.distance = options?.distance || '150m';
    this.duration = options?.duration || '12 phút';
    this.openingHours = options?.openingHours || '06:30 - 21:00';
    this.isOpen = options?.isOpen !== false;
    this.rating = options?.rating ?? 4.8;
    this.reviewCount = options?.reviewCount ?? 120;
    this.soldCount = options?.soldCount || '1.5K+';
    this.voucher = options?.voucher || '120.000đ';
    this.freeship = options?.freeship || 'Freeship 10.000đ';
    this.totalTables = options?.totalTables ?? 24;
    this.phone = options?.phone || '0988 123 456';
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      code: this.code,
      location: this.location,
      distance: this.distance,
      duration: this.duration,
      openingHours: this.openingHours,
      isOpen: this.isOpen,
      rating: this.rating,
      reviewCount: this.reviewCount,
      soldCount: this.soldCount,
      voucher: this.voucher,
      freeship: this.freeship,
      image: this.image,
      totalTables: this.totalTables,
      phone: this.phone,
    };
  }
}
