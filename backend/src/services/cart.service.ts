import { redisService } from './redis.service';
import { Cart, CartItem, Product } from '../models';
import type { SelectedOptionSnapshot } from '../types/cart.types';

const CART_TTL_SECONDS = 7 * 24 * 3600;
const CART_KEY = (userId: string) => `cart:${userId}`;

export class CartService {
  private optionsKey(opts: SelectedOptionSnapshot[] = []): string {
    return opts
      .map(o => `${o.groupId}:${o.optionId ?? o.itemId}`)
      .sort()
      .join('|');
  }

  private parseCartFromJSON(raw: any, userId: string): Cart {
    const cart = new Cart();
    cart.id = raw?.id || `cart-${userId}`;
    cart.userId = raw?.userId || userId;
    cart.canteenId = raw?.canteenId;
    cart.updatedAt = raw?.updatedAt ? new Date(raw.updatedAt) : new Date();
    cart.items = Array.isArray(raw?.items)
      ? raw.items.map((it: any) => this.toCartItem(it, cart.id))
      : [];
    return cart;
  }

  private toCartItem(it: any, cartId: string): CartItem {
    const item = new CartItem();
    item.id = it.id || `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    item.cartId = cartId;
    item.productId = it.productId || it.food?.id;
    item.productName = it.productName || it.food?.name || it.name || 'Món ăn';
    item.productImage = it.productImage || it.food?.image || it.image || '';
    item.basePrice = Number(it.basePrice || it.unitPrice || it.food?.price || 0);
    item.quantity = Math.max(1, Number(it.quantity || 1));
    item.notes = it.notes;
    item.createdAt = it.createdAt ? new Date(it.createdAt) : new Date();

    if (Array.isArray(it.selectedOptions)) {
      item.selectedOptions = it.selectedOptions;
    } else if (Array.isArray(it.selectedToppings)) {
      item.selectedOptions = it.selectedToppings.map((t: any) => ({
        groupId: t.groupId || 'topping',
        groupName: 'Topping',
        optionId: t.id,
        optionName: t.name,
        extraPrice: Number(t.price || 0),
      }));
    } else {
      item.selectedOptions = [];
    }
    return item;
  }

  public async getCart(userId: string): Promise<Cart> {
    try {
      const cached = await redisService.get<any>(CART_KEY(userId));
      if (cached && typeof cached === 'object' && Array.isArray(cached.items)) {
        return this.parseCartFromJSON(cached, userId);
      }
    } catch (err: any) {
      console.warn(`[CartService] Redis get error for ${userId}:`, err.message);
    }

    const cart = new Cart();
    cart.id = `cart-${userId}`;
    cart.userId = userId;
    cart.items = [];
    cart.updatedAt = new Date();
    await this.persistCart(userId, cart);
    return cart;
  }

  public async clearCart(userId: string): Promise<Cart> {
    const key = CART_KEY(userId);
    try {
      await redisService.del(key);
      console.log(`[Redis Cart] 🧹 Đã xóa giỏ hàng của user [${userId}]`);
    } catch (err: any) {
      console.warn(`[CartService] Redis del notice for key ${key}:`, err.message);
    }

    const cart = new Cart();
    cart.id = `cart-${userId}`;
    cart.userId = userId;
    cart.items = [];
    cart.updatedAt = new Date();
    return cart;
  }

  public getOrCreateCart(userId: string) {
    return this.getCart(userId);
  }

  public async persistCart(userId: string, cart: Cart): Promise<void> {
    try {
      await redisService.set(CART_KEY(userId), cart.toJSON(), CART_TTL_SECONDS);
    } catch (err: any) {
      console.warn(`[CartService] Redis set error for ${userId}:`, err.message);
    }
  }

  public async addItem(
    userId: string,
    data: { productId: string; quantity?: number; selectedOptions?: SelectedOptionSnapshot[]; notes?: string }
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    const product = await Product.findByPk(data.productId)
    if (!product) throw new Error('Món ăn không tồn tại hoặc đã ngừng phục vụ');

    if (cart.canteenId && cart.canteenId !== product.canteenId) {
      throw new Error('Giỏ hàng chỉ được chứa món từ một quầy. Vui lòng xóa giỏ trước.');
    }

    const newItem = new CartItem();
    newItem.id = `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    newItem.cartId = cart.id;
    newItem.productId = product.id;
    newItem.productName = product.name;
    newItem.productImage = product.image || '';
    newItem.basePrice = Number(product.price) || 0;
    newItem.quantity = Math.max(1, data.quantity || 1);
    newItem.selectedOptions = data.selectedOptions || [];
    newItem.notes = data.notes;
    newItem.createdAt = new Date();

    const keyNew = this.optionsKey(newItem.selectedOptions);
    const idx = cart.items.findIndex(
      it => it.productId === newItem.productId &&
        this.optionsKey(it.selectedOptions) === keyNew &&
        (it.notes ?? '') === (newItem.notes ?? '')
    );

    if (idx > -1) cart.items[idx].quantity += newItem.quantity;
    else cart.items.push(newItem);

    cart.canteenId = product.canteenId;
    cart.updatedAt = new Date();
    await this.persistCart(userId, cart);
    return cart;
  }
  /**
 * Xóa 1 item khỏi giỏ hàng theo itemId
 */
  public async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);

    const before = cart.items.length;
    cart.items = cart.items.filter((it) => it.id !== itemId);

    if (cart.items.length === before) {
      console.warn(
        `[CartService] removeItem: không tìm thấy item ${itemId} trong giỏ của ${userId}`
      );
    }

    cart.updatedAt = new Date();
    await this.persistCart(userId, cart);
    return cart;
  }

  public async syncCart(userId: string, rawItems: any[]): Promise<Cart> {
    const cart = new Cart();
    cart.id = `cart-${userId}`;
    cart.userId = userId;
    cart.items = [];
    cart.updatedAt = new Date();

    if (Array.isArray(rawItems)) {
      for (const it of rawItems) {
        const food = it.food || {};
        const productId = it.productId || food.id || it.id;
        const productName =
          it.productName || food.name || it.name || 'Món ăn';
        const productImage =
          it.productImage || food.image || it.image || '';
        const basePrice = Number(
          it.basePrice || it.unitPrice || food.price || it.price || 0
        );
        const quantity = Math.max(1, Number(it.quantity || 1));

        let selectedOptions: SelectedOptionSnapshot[] = [];
        if (Array.isArray(it.selectedOptions)) {
          selectedOptions = it.selectedOptions;
        } else if (Array.isArray(it.selectedToppings)) {
          selectedOptions = it.selectedToppings.map((t: any) => ({
            groupId: t.groupId || 'topping',
            groupName: 'Topping',
            optionId: t.id || t.optionId,
            optionName: t.name || t.optionName,
            extraPrice: Number(t.price || t.extraPrice || 0),
          }));
        }

        const item = new CartItem();
        item.id =
          it.id ||
          `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        item.cartId = cart.id;
        item.productId = productId;
        item.productName = productName;
        item.productImage = productImage;
        item.basePrice = basePrice;
        item.quantity = quantity;
        item.selectedOptions = selectedOptions;
        item.notes = it.notes;
        item.createdAt = it.createdAt ? new Date(it.createdAt) : new Date();

        const keyNew = this.optionsKey(selectedOptions);
        const existingIndex = cart.items.findIndex(
          (i) =>
            i.productId === item.productId &&
            this.optionsKey(i.selectedOptions) === keyNew &&
            (i.notes ?? '') === (item.notes ?? '')
        );

        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += item.quantity;
        } else {
          cart.items.push(item);
        }

        if (!cart.canteenId && (it.canteenId || food.canteenId)) {
          cart.canteenId = it.canteenId || food.canteenId;
        }
      }
    }

    await this.persistCart(userId, cart);
    return cart;
  }
  public async updateItemQuantity(
    userId: string,
    itemId: string,
    quantity: number
  ): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (quantity <= 0) {
      cart.items = cart.items.filter((it) => it.id !== itemId);
    } else {
      const item = cart.items.find((it) => it.id === itemId);
      if (!item) {
        throw new Error('Không tìm thấy món trong giỏ hàng');
      }
      item.quantity = quantity;
    }

    cart.updatedAt = new Date();
    await this.persistCart(userId, cart);
    return cart;
  }
}
export const cartService = new CartService();