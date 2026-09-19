export type OptionType = 'SIZE' | 'TOPPING' | 'SUGAR_LEVEL' | 'ICE_LEVEL' | 'CUSTOM';

export class ProductOptionItem {
  public id: string;
  public name: string;
  public extraPrice: number;
  public isDefault: boolean;

  constructor(id: string, name: string, extraPrice: number = 0, isDefault: boolean = false) {
    this.id = id;
    this.name = name;
    this.extraPrice = extraPrice;
    this.isDefault = isDefault;
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      extraPrice: this.extraPrice,
      isDefault: this.isDefault,
    };
  }
}

export class ProductOption {
  public id: string;
  public productId: string;
  public name: string; // e.g. "Chọn Size", "Thêm Topping", "Độ ngọt", "Lượng đá"
  public type: OptionType;
  public isRequired: boolean;
  public maxSelect: number; // 1 for single choice (radio), >1 for multiple (checkboxes)
  public items: ProductOptionItem[];

  constructor(
    id: string,
    productId: string,
    name: string,
    type: OptionType,
    isRequired: boolean = false,
    maxSelect: number = 1,
    items: ProductOptionItem[] = []
  ) {
    this.id = id;
    this.productId = productId;
    this.name = name;
    this.type = type;
    this.isRequired = isRequired;
    this.maxSelect = maxSelect;
    this.items = items;
  }

  public addItem(item: ProductOptionItem): void {
    this.items.push(item);
  }

  public toJSON() {
    return {
      id: this.id,
      productId: this.productId,
      name: this.name,
      type: this.type,
      isRequired: this.isRequired,
      maxSelect: this.maxSelect,
      items: this.items.map((i) => i.toJSON()),
    };
  }
}
