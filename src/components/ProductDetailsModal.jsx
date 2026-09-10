import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import aafiyaLogo from '../assets/aafiya-logo.png';
import './ProductDetailsModal.scss';

export default function ProductDetailsModal({ product, onClose }) {
  const { addToCart, openCart } = useCart();
  const isOil = Boolean(product?.packageSizes && product.packageSizes.length > 0);

  // Spices (weight in kg)
  const [selectedWeight, setSelectedWeight] = useState(1);

  // Oils (package sizes)
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [bottleCount, setBottleCount] = useState(1);

  useEffect(() => {
    // Lock scroll when modal is open
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!product) return null;

  const image =
    product.images?.[0] ||
    (isOil
      ? 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800'
      : 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800');

  const brandName = isOil
    ? 'Aafiya Cold Pressed Oils'
    : 'Ibrahim Masala Mill';

  const badgeText = isOil
    ? 'Wood-Pressed (Chekku)'
    : 'Freshly Stone Ground';

  // Pricing calculations
  let unitLabel = '/ kg';
  let displayPrice = 0;
  let totalPrice = 0;
  let calculationNote = '';

  if (isOil) {
    const activePkg = product.packageSizes[selectedPackageIndex] || product.packageSizes[0];
    unitLabel = `/ ${activePkg.size}`;
    displayPrice = activePkg.price;
    totalPrice = activePkg.price * bottleCount;
    calculationNote = `(${bottleCount} × ${activePkg.size} @ ₹${activePkg.price})`;
  } else {
    const pricePerKg = product.pricePerKg || 0;
    displayPrice = pricePerKg;
    unitLabel = '/ kg';
    totalPrice = Math.round(pricePerKg * selectedWeight);
    calculationNote = `(${selectedWeight} kg × ₹${pricePerKg})`;
  }

  const weightPresets = [
    { label: '500 g', value: 0.5 },
    { label: '1 kg', value: 1 },
    { label: '2 kg', value: 2 },
    { label: '5 kg', value: 5 },
  ];

  const handleAddToCart = () => {
    if (isOil) {
      const activePkg = product.packageSizes[selectedPackageIndex] || product.packageSizes[0];
      addToCart(product, bottleCount, {
        unit: activePkg.size,
        price: activePkg.price,
        business: brandName,
      });
    } else {
      addToCart(product, selectedWeight, {
        unit: 'kg',
        price: product.pricePerKg || 0,
        business: brandName,
      });
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    onClose();
    openCart();
  };

  return (
    <div className="product-modal-backdrop" onClick={onClose} data-lenis-prevent="true">
      <div
        className="product-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        <button className="product-modal-close" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        <div className="product-modal-grid" data-lenis-prevent="true">
          {/* Image Column */}
          <div className="product-modal-gallery">
            <div
              className="product-modal-img"
              style={{ backgroundImage: `url(${image})` }}
            >
              <span className="product-modal-badge">{badgeText}</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="product-modal-info" data-lenis-prevent="true">
            <div className="product-brand-line">
              {isOil && <img src={aafiyaLogo} alt="Aafiya" className="brand-crest" />}
              <span className="product-brand">{brandName}</span>
            </div>
            <h2 className="product-title">{product.name}</h2>

            <div className="product-pricing-bar">
              <span className="product-price">₹{displayPrice}</span>
              <span className="product-unit">{unitLabel}</span>
              {product.availableQuantityKg > 0 && (
                <span className="stock-pill stock-pill--in">
                  ● In Stock ({product.availableQuantityKg} kg available)
                </span>
              )}
            </div>

            <div className="product-desc">
              <h4>Description &amp; Purity</h4>
              <p>
                {product.description ||
                  (isOil
                    ? 'Extracted using traditional wood (chekku) presses at low speed and temperature. Zero heat, zero chemical solvents, retaining 100% natural aroma, healthy fats, and vitamins.'
                    : 'Stone-ground to perfection using time-honored traditional techniques. Retains authentic natural oils, rich aroma, and authentic spice flavors without any artificial colors or chemical preservatives.')}
              </p>
            </div>

            {/* Selection Section: Packages for Oils OR Weight for Spices */}
            {isOil ? (
              <div className="weight-selector-section">
                <label>Select Bottle Size:</label>
                <div className="weight-presets">
                  {product.packageSizes.map((pkg, idx) => (
                    <button
                      key={pkg.size}
                      type="button"
                      className={`weight-pill ${selectedPackageIndex === idx ? 'active' : ''}`}
                      onClick={() => setSelectedPackageIndex(idx)}
                    >
                      {pkg.size} · ₹{pkg.price}
                    </button>
                  ))}
                </div>

                <div className="quantity-stepper-box">
                  <span className="stepper-label">Number of Bottles:</span>
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() => setBottleCount((prev) => Math.max(1, prev - 1))}
                    >
                      –
                    </button>
                    <span className="stepper-val">{bottleCount}</span>
                    <button
                      type="button"
                      onClick={() => setBottleCount((prev) => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="weight-selector-section">
                <label>Select Weight / Quantity:</label>
                <div className="weight-presets">
                  {weightPresets.map((wp) => (
                    <button
                      key={wp.value}
                      type="button"
                      className={`weight-pill ${selectedWeight === wp.value ? 'active' : ''}`}
                      onClick={() => setSelectedWeight(wp.value)}
                    >
                      {wp.label}
                    </button>
                  ))}
                </div>

                <div className="quantity-stepper-box">
                  <span className="stepper-label">Custom Quantity:</span>
                  <div className="quantity-stepper">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedWeight((prev) =>
                          Math.max(0.5, Math.round((prev - 0.5) * 10) / 10)
                        )
                      }
                    >
                      –
                    </button>
                    <span className="stepper-val">{selectedWeight} kg</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedWeight((prev) => Math.round((prev + 0.5) * 10) / 10)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Total Calculation */}
            <div className="product-total-bar">
              <span className="total-label">Total Price:</span>
              <span className="total-amount">₹{totalPrice}</span>
              <small className="calc-breakdown">{calculationNote}</small>
            </div>

            {/* Action Buttons */}
            <div className="product-modal-actions">
              <button
                type="button"
                className="btn btn--outline btn-add-cart"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart
              </button>
              <button
                type="button"
                className="btn btn--primary btn-buy-now"
                onClick={handleBuyNow}
              >
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
