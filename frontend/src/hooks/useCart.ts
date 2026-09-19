/**
 * HOOK USECART - QUẢN LÝ GIỎ HÀNG
 */
import { useApp } from '../store/AppContext';

export function useCart() {
  const {
    cart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useApp();

  return {
    items: cart,
    count: cartCount,
    total: cartTotal,
    addToCart,
    updateQuantity: updateCartItemQuantity,
    removeItem: removeFromCart,
    clearCart,
  };
}
