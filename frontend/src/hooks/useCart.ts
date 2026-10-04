/**
 * HOOK USECART - QUẢN LÝ GIỎ HÀNG
 */
import { useApp } from '../store/AppContext';

export function useCart() {
  const {
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useApp();

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cart,
    count,
    total: subtotal,
    addToCart,
    updateQuantity: updateCartQuantity,
    removeItem: removeFromCart,
    clearCart,
  };
}
