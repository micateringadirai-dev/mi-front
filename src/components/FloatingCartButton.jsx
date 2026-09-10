import { useCart } from '../context/CartContext.jsx';
import './FloatingCartButton.scss';

export default function FloatingCartButton() {
  const { totalCount, totalAmount, openCart } = useCart();

  if (totalCount === 0) return null;

  return (
    <button
      type="button"
      className="floating-cart-btn"
      onClick={openCart}
      aria-label="View Shopping Cart"
    >
      <span className="cart-icon">🛒</span>
      <span className="cart-count">{totalCount}</span>
      <span className="cart-divider">|</span>
      <span className="cart-amount">₹{totalAmount}</span>
    </button>
  );
}
