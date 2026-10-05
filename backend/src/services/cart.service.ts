/**
 * ==============================================================================
 * DỊCH VỤ GIỎ HÀNG REDIS (REDIS-BACKED SHOPPING CART SERVICE)
 * ==============================================================================
 * Kỹ thuật chuẩn công nghiệp:
 * 1. Chống "rác" Database: Giỏ hàng chưa thanh toán không lưu vào MySQL mà lưu
 *    vào Redis với TTL 7 ngày (tự động giải phóng bộ nhớ khi quá hạn).
 * 2. Tốc độ bàn thờ: Đọc/ghi siêu tốc (~0.1ms) trên RAM Redis khi người dùng
 *    tăng/giảm số lượng hoặc chọn món.
 * 3. Hỗ trợ cấu trúc lồng nhau phức tạp (Món ăn -> Topping -> Ghi chú) dưới dạng JSON.
 * 4. Quy trình chuyển sinh: Khi bấm "Đặt hàng", Backend lấy dữ liệu giỏ hàng từ
 *    Redis lưu vào MySQL `orders` và `order_details`, sau đó gọi `redis.del('cart:' + userId)`!
 * ==============================================================================
 */

import { db } from './database.service';
import { redisService } from './redis.service';
import { Cart, CartItem, SelectedOptionSnapshot } from '../models';

const CART_TTL_SECONDS = 7 * 24 * 3600; // 7 ngày theo chuẩn nghiệp vụ

export class CartService {
  private getRedisKey(userId: string): string {
    return `cart:${userId}`;
  }

  /**
   * Lấy giỏ hàng của người dùng từ Redis (với fallback in-memory)
   */
  public async getCart(userId: string): Promise<Cart> {
    const key = this.getRedisKey(userId);

    try {
      const cached = await redisService.get<any>(key);
      if (cached) {
        const cart = Cart.fromJSON(cached);
        db.carts.set(userId, cart);
        return cart;
      }
    } catch (err: any) {
      console.warn(`[CartService] Redis get notice for user ${userId}:`, err.message);
    }

    // Fallback: Lấy từ in-memory nếu có
    let cart = db.carts.get(userId);
    if (!cart) {
      cart = new Cart(`cart-${userId}`, userId);
      db.carts.set(userId, cart);
    }
    return cart;
  }

  /**
   * Alias tương thích getOrCreateCart
   */
  public async getOrCreateCart(userId: string): Promise<Cart> {
    return this.getCart(userId);
  }

  /**
   * Lưu giỏ hàng vào Redis với TTL 7 ngày
   */
  private async persistCart(userId: string, cart: Cart): Promise<void> {
    db.carts.set(userId, cart);
    const key = this.getRedisKey(userId);
    try {
      await redisService.set(key, cart.toJSON(), CART_TTL_SECONDS);
    } catch (err: any) {
      console.warn(`[CartService] Redis set notice for key ${key}:`, err.message);
    }
  }

  /**
   * Thêm món ăn vào giỏ hàng và lưu ngay vào Redis
   */
  public async addItem(
    userId: string,
    data: {
      productId: string;
      quantity?: number;
      selectedOptions?: SelectedOptionSnapshot[];
      notes?: string;
    }
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = db.products.get(data.productId);
    if (!product) {
      throw new Error('Món ăn không tồn tại hoặc đã ngừng phục vụ');
    }

    const item = new CartItem(
      `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cart.id,
      product.id,
      product.name,
      product.image,
      product.price,
      data.quantity || 1,
      data.selectedOptions || [],
      data.notes
    );

    cart.addItem(item);
    cart.canteenId = product.canteenId;
    await this.persistCart(userId, cart);
    return cart;
  }

  /**
   * Cập nhật số lượng món trong giỏ hàng và lưu vào Redis
   */
  public async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.updateItemQuantity(itemId, quantity);
    await this.persistCart(userId, cart);
    return cart;
  }

  /**
   * Xóa một món khỏi giỏ hàng trong Redis
   */
  public async removeItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.removeItem(itemId);
    await this.persistCart(userId, cart);
    return cart;
  }

  /**
   * Đồng bộ toàn bộ danh sách món từ frontend lên Redis (Sync Cart)
   */
  public async syncCart(userId: string, rawItems: any[]): Promise<Cart> {
    const cart = new Cart(`cart-${userId}`, userId);
    if (Array.isArray(rawItems)) {
      for (const it of rawItems) {
        const food = it.food || {};
        const productId = it.productId || food.id || it.id;
        const productName = it.productName || food.name || it.name || 'Món ăn';
        const productImage = it.productImage || food.image || it.image || '';
        const basePrice = Number(it.basePrice || it.unitPrice || food.price || it.price || 0);
        const quantity = Math.max(1, Number(it.quantity || 1));

        let selectedOptions: SelectedOptionSnapshot[] = [];
        if (Array.isArray(it.selectedOptions)) {
          selectedOptions = it.selectedOptions;
        } else if (Array.isArray(it.selectedToppings)) {
          selectedOptions = it.selectedToppings.map((t: any) => ({
            groupId: t.groupId || 'topping',
            groupName: 'Topping',
            optionId: t.id,
            optionName: t.name,
            price: Number(t.price || 0),
          }));
        }

        const item = new CartItem(
          it.id || `ci-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          cart.id,
          productId,
          productName,
          productImage,
          basePrice,
          quantity,
          selectedOptions,
          it.notes
        );
        cart.addItem(item);
      }
    }

    await this.persistCart(userId, cart);
    return cart;
  }

  /**
   * Giai đoạn Dọn dẹp: Xóa trắng giỏ hàng trong Redis (sau khi lưu MySQL thành công)
   */
  public async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.clear();
    db.carts.delete(userId);

    const key = this.getRedisKey(userId);
    try {
      await redisService.del(key);
      console.log(`[Redis Cart] 🧹 Đã dọn dẹp khóa Redis "${key}" sau khi đơn hàng được lưu MySQL.`);
    } catch (err: any) {
      console.warn(`[CartService] Redis del notice for key ${key}:`, err.message);
    }

    return cart;
  }
}

export const cartService = new CartService();
