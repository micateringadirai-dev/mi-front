import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/client';
import './CartDrawer.scss';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCount,
    totalAmount,
    clearCart,
  } = useCart();

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'checkout'

  if (!isCartOpen) return null;

  const handleQtyChange = (id, delta) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.round((item.quantity + delta) * 10) / 10;
    updateQuantity(id, newQty);
  };

  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();
    if (!checkoutForm.customerName.trim() || !checkoutForm.phoneNumber.trim()) {
      return toast.error('Please provide your name and phone number');
    }

    const itemsSummary = items
      .map(
        (i) =>
          `• *${i.name}* (${i.quantity} ${i.unit}) — ₹${Math.round(i.unitPrice * i.quantity)}`
      )
      .join('\n');

    const message = `🛍️ *NEW ORDER - MI GROUPS*\n` +
      `-----------------------------------\n` +
      `👤 *Customer:* ${checkoutForm.customerName.trim()}\n` +
      `📞 *Phone:* ${checkoutForm.phoneNumber.trim()}\n` +
      `📍 *Address:* ${checkoutForm.address.trim() || 'To be confirmed on call'}\n` +
      (checkoutForm.notes.trim() ? `📝 *Notes:* ${checkoutForm.notes.trim()}\n` : '') +
      `-----------------------------------\n` +
      `📦 *ORDER ITEMS:*\n${itemsSummary}\n` +
      `-----------------------------------\n` +
      `💰 *TOTAL AMOUNT: ₹${totalAmount}*\n` +
      `-----------------------------------\n` +
      `Please confirm my order and share delivery details!`;

    const hasCatering = items.some((i) => i.business?.toLowerCase().includes('catering'));
    const phone = hasCatering ? '919842096814' : '919629533887';
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    clearCart();
    closeCart();
    toast.success('Order generated! Opening WhatsApp...', { icon: '📱' });
  };

  const handleOnlineOrder = async (e) => {
    e.preventDefault();
    if (!checkoutForm.customerName.trim() || !checkoutForm.phoneNumber.trim() || !checkoutForm.address.trim()) {
      return toast.error('Please enter name, phone, and delivery address');
    }

    setSubmitting(true);
    try {
      // Create enquiry in backend so it appears in Admin Dashboard
      const itemsList = items
        .map((i) => `${i.name} (${i.quantity} ${i.unit})`)
        .join(', ');

      const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

      await api.post('/masala/enquiries', {
        productName: itemsList,
        quantityKg: Math.max(0.5, totalQty),
        customerName: checkoutForm.customerName.trim(),
        phoneNumber: checkoutForm.phoneNumber.trim(),
        address: checkoutForm.address.trim(),
        message: `Cart Order (Total: ₹${totalAmount}). Notes: ${checkoutForm.notes.trim() || '-'}`,
      });

      toast.success('Order submitted successfully! Our team will contact you.', {
        duration: 5000,
        icon: '🎉',
      });
      clearCart();
      closeCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={closeCart} data-lenis-prevent="true">
      <div
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        {/* Drawer Header */}
        <div className="cart-drawer__header">
          <div className="header-title">
            <span className="cart-icon">🛒</span>
            <h3>Shopping Cart</h3>
            <span className="item-count-badge">{totalCount} items</span>
          </div>
          <button className="close-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* View Switcher if items exist */}
        {items.length > 0 && (
          <div className="cart-drawer__tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
              onClick={() => setActiveTab('cart')}
            >
              1. Review Items ({items.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'checkout' ? 'active' : ''}`}
              onClick={() => setActiveTab('checkout')}
            >
              2. Delivery &amp; Checkout
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div className="cart-drawer__body" data-lenis-prevent="true">
          {items.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-icon">🛍️</span>
              <h4>Your cart is empty</h4>
              <p>Explore our fresh stone-ground spices and add items to your basket.</p>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={closeCart}
              >
                Explore Products
              </button>
            </div>
          ) : activeTab === 'cart' ? (
            <div className="cart-items-list">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div
                    className="cart-item__thumb"
                    style={{
                      backgroundImage: item.image
                        ? `url(${item.image})`
                        : 'none',
                    }}
                  >
                    {!item.image && '🌶️'}
                  </div>

                  <div className="cart-item__details">
                    <div className="cart-item__name">{item.name}</div>
                    <div className="cart-item__rate">
                      ₹{item.unitPrice} / {item.unit}
                    </div>

                    <div className="cart-item__stepper">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -0.5)}
                      >
                        –
                      </button>
                      <span>
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 0.5)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__price-box">
                    <span className="subtotal">
                      ₹{Math.round(item.unitPrice * item.quantity)}
                    </span>
                    <button
                      type="button"
                      className="btn-trash"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Checkout Form */
            <form id="cart-checkout-form" className="checkout-form">
              <div className="checkout-badge">📍 Delivery Information</div>

              <div className="form-field">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mohamed Ashik"
                  value={checkoutForm.customerName}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      customerName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={checkoutForm.phoneNumber}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Delivery Address *</label>
                <textarea
                  rows="2"
                  placeholder="House / Street, Town / City, Pincode..."
                  value={checkoutForm.address}
                  onChange={(e) =>
                    setCheckoutForm({
                      ...checkoutForm,
                      address: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-field">
                <label>Special Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, extra spicy blend..."
                  value={checkoutForm.notes}
                  onChange={(e) =>
                    setCheckoutForm({ ...checkoutForm, notes: e.target.value })
                  }
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="summary-row">
              <span>Subtotal ({totalCount} items):</span>
              <span className="summary-amount">₹{totalAmount}</span>
            </div>

            <div className="delivery-perk">
              <span>🚚</span>
              <span>Fresh stone-ground delivery direct to your doorstep</span>
            </div>

            {activeTab === 'cart' ? (
              <button
                type="button"
                className="btn btn--primary btn-proceed"
                onClick={() => setActiveTab('checkout')}
              >
                Proceed to Checkout (₹{totalAmount}) &rarr;
              </button>
            ) : (
              <div className="checkout-action-buttons">
                <button
                  type="button"
                  className="btn btn--whatsapp"
                  onClick={handleWhatsAppCheckout}
                >
                  📱 Order on WhatsApp
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={handleOnlineOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : '✅ Confirm Order Online'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
