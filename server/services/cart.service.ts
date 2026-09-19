import { db } from './database.service';
import { Cart, CartItem, SelectedOptionSnapshot } from '../models';

export class CartService {
  public getOrCreateCart(userId: string): Cart {
    let cart = db.carts.get(userId);
    if (!cart) {
      cart = new Cart(`cart-${userId}`, userId);
      db.carts.set(userId, cart);
    }
    return cart;
  }

  public addItem(
    userId: string,
    data: {
      productId: string;
      quantity?: number;
      selectedOptions?: SelectedOptionSnapshot[];
      notes?: string;
    }
  ): Cart {
    const cart = this.getOrCreateCart(userId);
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
    return cart;
  }

  public updateItemQuantity(userId: string, itemId: string, quantity: number): Cart {
    const cart = this.getOrCreateCart(userId);
    cart.updateItemQuantity(itemId, quantity);
    return cart;
  }

  public removeItem(userId: string, itemId: string): Cart {
    const cart = this.getOrCreateCart(userId);
    cart.removeItem(itemId);
    return cart;
  }

  public clearCart(userId: string): Cart {
    const cart = this.getOrCreateCart(userId);
    cart.clear();
    return cart;
  }
}

export const cartService = new CartService();
