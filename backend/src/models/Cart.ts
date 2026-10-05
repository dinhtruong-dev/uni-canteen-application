import { SelectedOptionSnapshot } from './OptionGroup';
export type { SelectedOptionSnapshot };

export class CartItem {
  public id: string;
  public cartId: string;
  public productId: string;
  public productName: string;
  public productImage: string;
  public basePrice: number;
  public quantity: number;
  public selectedOptions: SelectedOptionSnapshot[];
  public notes?: string;
  public createdAt: Date;

  constructor(
    id: string,
    cartId: string,
    productId: string,
    productName: string,
    productImage: string,
    basePrice: number,
    quantity: number = 1,
    selectedOptions: SelectedOptionSnapshot[] = [],
    notes?: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.cartId = cartId;
    this.productId = productId;
    this.productName = productName;
    this.productImage = productImage;
    this.basePrice = basePrice;
    this.quantity = Math.max(1, quantity);
    this.selectedOptions = selectedOptions;
    this.notes = notes;
    this.createdAt = createdAt;
  }

  public getUnitPrice(): number {
    const extra = this.selectedOptions.reduce((acc, curr) => acc + (curr.price ?? curr.extraPrice ?? 0), 0);
    return this.basePrice + extra;
  }

  public getItemTotal(): number {
    return this.getUnitPrice() * this.quantity;
  }

  public updateQuantity(quantity: number): void {
    this.quantity = Math.max(1, quantity);
  }

  public toJSON() {
    return {
      id: this.id,
      cartId: this.cartId,
      productId: this.productId,
      productName: this.productName,
      productImage: this.productImage,
      basePrice: this.basePrice,
      quantity: this.quantity,
      selectedOptions: this.selectedOptions,
      notes: this.notes,
      unitPrice: this.getUnitPrice(),
      itemTotal: this.getItemTotal(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}

export class Cart {
  public id: string;
  public userId: string;
  public canteenId?: string;
  public items: CartItem[];
  public updatedAt: Date;

  constructor(id: string, userId: string, canteenId?: string, items: CartItem[] = []) {
    this.id = id;
    this.userId = userId;
    this.canteenId = canteenId;
    this.items = items;
    this.updatedAt = new Date();
  }

  public addItem(item: CartItem): void {
    // Check if an identical item already exists (same product + options)
    const existingIndex = this.items.findIndex(
      (it) =>
        it.productId === item.productId &&
        JSON.stringify(it.selectedOptions) === JSON.stringify(item.selectedOptions) &&
        it.notes === item.notes
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += item.quantity;
    } else {
      this.items.push(item);
    }
    this.updatedAt = new Date();
  }

  public removeItem(itemId: string): boolean {
    const prevLen = this.items.length;
    this.items = this.items.filter((it) => it.id !== itemId);
    this.updatedAt = new Date();
    return this.items.length < prevLen;
  }

  public updateItemQuantity(itemId: string, quantity: number): boolean {
    const item = this.items.find((it) => it.id === itemId);
    if (!item) return false;
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    item.updateQuantity(quantity);
    this.updatedAt = new Date();
    return true;
  }

  public clear(): void {
    this.items = [];
    this.updatedAt = new Date();
  }

  public getTotalItems(): number {
    return this.items.reduce((acc, it) => acc + it.quantity, 0);
  }

  public getTotalAmount(): number {
    return this.items.reduce((acc, it) => acc + it.getItemTotal(), 0);
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      canteenId: this.canteenId,
      items: this.items.map((it) => it.toJSON()),
      totalItems: this.getTotalItems(),
      totalAmount: this.getTotalAmount(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static fromJSON(raw: any): Cart {
    if (!raw) return new Cart(`cart-${Date.now()}`, '');
    const items = Array.isArray(raw.items)
      ? raw.items.map((it: any) => new CartItem(
          it.id || `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          raw.id || `cart-${raw.userId}`,
          it.productId || it.food?.id,
          it.productName || it.food?.name || it.name,
          it.productImage || it.food?.image || it.image || '',
          Number(it.basePrice || it.unitPrice || it.food?.price || 0),
          Math.max(1, Number(it.quantity || 1)),
          Array.isArray(it.selectedOptions)
            ? it.selectedOptions
            : Array.isArray(it.selectedToppings)
              ? it.selectedToppings.map((t: any) => ({
                  groupId: t.groupId || 'topping',
                  groupName: 'Topping',
                  optionId: t.id,
                  optionName: t.name,
                  price: t.price || 0,
                }))
              : [],
          it.notes,
          it.createdAt ? new Date(it.createdAt) : new Date()
        ))
      : [];
    const cart = new Cart(raw.id || `cart-${raw.userId}`, raw.userId || '', raw.canteenId, items);
    if (raw.updatedAt) {
      cart.updatedAt = new Date(raw.updatedAt);
    }
    return cart;
  }
}

