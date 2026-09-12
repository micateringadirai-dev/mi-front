import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { useCart } from '../context/CartContext.jsx';
import aafiyaLogo from '../assets/aafiya-logo.png';
import './BusinessPage.scss';

/* ── Oil Drop Ripple sub-component ── */
function OilDropHero({ logo }) {
  const [phase, setPhase] = useState(0);
  // 0=hidden  1=drop falls  2=ripple+logo rises  3=text up

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);   // drop falls
    const t2 = setTimeout(() => setPhase(2), 820);   // ripple + logo rise
    const t3 = setTimeout(() => setPhase(3), 1350);  // text slides up
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      {/* Logo stage */}
      <div className="oil-logo-stage">
        {/* The falling droplet */}
        <span className={`oil-drop${phase >= 1 ? ' is-falling' : ''}`} aria-hidden="true" />
        {/* 3 ripple rings on splash */}
        <span className={`oil-ripple oil-ripple--1${phase >= 2 ? ' is-active' : ''}`} aria-hidden="true" />
        <span className={`oil-ripple oil-ripple--2${phase >= 2 ? ' is-active' : ''}`} aria-hidden="true" />
        <span className={`oil-ripple oil-ripple--3${phase >= 2 ? ' is-active' : ''}`} aria-hidden="true" />
        {/* Logo rises from splash */}
        <img
          src={logo}
          alt="Aafiya Cold Pressed Oils Logo"
          className={`oil-hero-logo${phase >= 2 ? ' is-visible' : ''}`}
        />
      </div>

      {/* Text block */}
      <div className={`oil-hero-text${phase >= 3 ? ' is-visible' : ''}`}>
        <span className="eyebrow">Aafiya Cold Pressed Oils</span>
        <h1>Pure Chekku Oils</h1>
        <p>Traditional cold-press extraction — no heat, no chemicals, just pure nutrition.</p>
        <div className="business-hero__ctas">
          <a href="#enquiry" className="btn btn--primary">Enquire Now</a>
          <a href="tel:+919629533887" className="btn btn--outline">
            📞 +91 96295 33887
          </a>
        </div>
      </div>
    </>
  );
}


export default function ColdPressOil() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productName: '',
    size: '',
    quantity: 1,
    customerName: '',
    phoneNumber: '',
    address: '',
    additionalRequirements: '',
  });

  useEffect(() => {
    api
      .get('/oil/products')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch((err) => console.warn('Could not load live oil products, using defaults:', err.message));
  }, []);

  const staticProducts = Array.isArray(products) && products.length > 0
    ? products
    : [
        { _id: 'sesame', name: 'Sesame Oil (Nallennai)', description: 'Traditional cold-pressed sesame oil.', packageSizes: [{ size: '500ml', price: 250 }, { size: '1L', price: 480 }] },
        { _id: 'coconut', name: 'Coconut Oil', description: 'Pure cold-pressed coconut oil.', packageSizes: [{ size: '500ml', price: 200 }, { size: '1L', price: 380 }] },
        { _id: 'groundnut', name: 'Groundnut Oil', description: 'Cold-pressed groundnut oil, rich in flavor.', packageSizes: [{ size: '500ml', price: 220 }, { size: '1L', price: 420 }] },
      ];

  const selectedProduct = staticProducts.find((p) => p.name === form.productName);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.size || !form.customerName || !form.phoneNumber || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/oil/enquiries', form);
      toast.success('Enquiry submitted! Our team will contact you to confirm.');
      setForm({ productName: '', size: '', quantity: 1, customerName: '', phoneNumber: '', address: '', additionalRequirements: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="business-page business-page--oil">
      {/* ── Oil Drop Ripple Hero ── */}
      <style>{`
        @keyframes oil-drop-fall {
          0%   { transform: translateY(-80px) scaleY(1.3); opacity: 0; }
          60%  { transform: translateY(0px)   scaleY(0.85); opacity: 1; }
          80%  { transform: translateY(-8px)  scaleY(1.05); opacity: 1; }
          100% { transform: translateY(0px)   scaleY(1); opacity: 0; }
        }
        @keyframes oil-ripple {
          0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(3.2); opacity: 0; }
        }
        @keyframes oil-logo-rise {
          0%   { opacity: 0; transform: translateY(30px) scale(0.82); filter: drop-shadow(0 0 0px rgba(180,140,30,0)); }
          55%  { opacity: 1; transform: translateY(-8px) scale(1.06); filter: drop-shadow(0 0 40px rgba(180,140,30,0.8)); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    filter: drop-shadow(0 8px 24px rgba(0,0,0,0.35)); }
        }
        @keyframes oil-logo-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes oil-text-up {
          0%   { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Drop */
        .oil-drop {
          position: absolute;
          top: 0; left: 50%;
          transform: translateX(-50%);
          width: 18px; height: 26px;
          background: radial-gradient(ellipse at 40% 30%, #f5d76e, #c9a227 60%, #7a5c00);
          border-radius: 50% 50% 55% 55% / 60% 60% 40% 40%;
          opacity: 0;
          z-index: 5;
          pointer-events: none;
          filter: drop-shadow(0 4px 10px rgba(180,140,20,0.6));
        }
        .oil-drop.is-falling {
          animation: oil-drop-fall 0.72s cubic-bezier(0.55,0,0.6,1) forwards;
        }

        /* Ripple rings */
        .oil-ripple {
          position: absolute;
          top: 50%; left: 50%;
          width: 180px; height: 65px;
          border-radius: 50%;
          border: 2px solid rgba(180,140,30,0.7);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%,-50%) scale(0.2);
        }
        .oil-ripple.is-active {
          animation: oil-ripple 1.1s cubic-bezier(0.2,0.6,0.4,1) forwards;
        }
        .oil-ripple--2.is-active { animation-delay: 0.22s; border-color: rgba(180,140,30,0.45); }
        .oil-ripple--3.is-active { animation-delay: 0.44s; border-color: rgba(180,140,30,0.25); }

        /* Logo */
        .oil-logo-stage {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1.5rem;
          height: 195px;
        }
        .oil-hero-logo {
          position: relative; z-index: 2;
          max-height: 180px;
          max-width: min(90vw, 360px);
          width: auto; object-fit: contain;
          opacity: 0;
        }
        .oil-hero-logo.is-visible {
          animation:
            oil-logo-rise 0.9s cubic-bezier(0.22,1,0.36,1) forwards,
            oil-logo-float 3.8s 1s ease-in-out infinite;
        }
        /* Text */
        .oil-hero-text { opacity: 0; }
        .oil-hero-text.is-visible {
          animation: oil-text-up 0.75s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @media (max-width: 768px) {
          .oil-logo-stage { height: 155px; }
          .oil-hero-logo.is-visible { max-height: 140px; }
        }
        @media (max-width: 480px) {
          .oil-logo-stage { height: 125px; }
          .oil-hero-logo.is-visible { max-height: 110px; }
        }
      `}</style>

      <section className="business-hero">
        <div className="container">
          <OilDropHero logo={aafiyaLogo} />
        </div>

        <div className="business-hero__curve" aria-hidden="true">
          <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none">
            <path d="M0,0 C360,50 1080,50 1440,50 L1440,50 L0,50 Z" fill="#fdfbf7" />
          </svg>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2">
          <div>
            <span className="eyebrow">Our Process</span>
            <RevealText as="h2">The Traditional Cold-Pressed Method</RevealText>
            <p>
              Aafiya Cold Pressed Oils is extracted using traditional cold presses that
              operate at low speed and low temperature, preserving natural nutrients, aroma, and
              flavor — completely free from chemical solvents or refining.
            </p>
          </div>
          <div className="grid grid--2">
            {['Cold-Pressed Oils', 'No Chemicals Used', 'Cold Extraction', 'Lab-Tested Purity'].map((c) => (
              <div className="card" key={c}><h3>{c}</h3></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Oils</span>
            <h2>Product Range</h2>
          </div>
          <div className="grid grid--3">
            {staticProducts.map((p) => {
              const defaultPkg = p.packageSizes?.[0] || { size: '500ml', price: 250 };
              return (
                <div className="card product-card" key={p._id}>
                  <div
                    className="product-card__img"
                    style={{
                      backgroundImage: `url(${p.images?.[0] || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600'})`
                    }}
                    onClick={() => setSelectedProductModal(p)}
                  />
                  <h3 onClick={() => setSelectedProductModal(p)}>{p.name}</h3>
                  <p className="product-card__desc">{p.description}</p>
                  <div className="product-card__meta">
                    <span className="price-tag">₹{defaultPkg.price}</span>
                    <span className="stock-tag">
                      {p.packageSizes?.map((s) => s.size).join(' · ')}
                    </span>
                  </div>
                  <div className="product-card__actions">
                    <button
                      type="button"
                      className="btn btn--outline btn--sm btn-view-details"
                      onClick={() => setSelectedProductModal(p)}
                    >
                      👁️ View Details
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm btn-add-cart"
                      onClick={() =>
                        addToCart(p, 1, {
                          unit: defaultPkg.size,
                          price: defaultPkg.price,
                          business: 'Aafiya Cold Pressed Oils',
                        })
                      }
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProductModal && (
        <ProductDetailsModal
          product={selectedProductModal}
          onClose={() => setSelectedProductModal(null)}
        />
      )}

      {/* Why Choose AAFIYA Section */}
      <section className="section why-aafiya-section">
        <div className="container">
          <div className="section-heading text-center">
            <span className="eyebrow">The Aafiya Standard</span>
            <RevealText as="h2">Why Choose AAFIYA?</RevealText>
          </div>

          <div className="why-aafiya-grid">
            <div className="why-aafiya-card">
              <div className="why-aafiya-card__icon">🌱</div>
              <h3>Carefully Selected Ingredients</h3>
              <p>We select quality seeds and nuts for our cold pressed oils.</p>
            </div>

            <div className="why-aafiya-card">
              <div className="why-aafiya-card__icon">🪵</div>
              <h3>Cold Pressed Process</h3>
              <p>Our oils are produced using a controlled cold pressing process.</p>
            </div>

            <div className="why-aafiya-card">
              <div className="why-aafiya-card__icon">🌿</div>
              <h3>Natural Aroma &amp; Flavour</h3>
              <p>Our process is designed to retain the natural character of the ingredients.</p>
            </div>

            <div className="why-aafiya-card">
              <div className="why-aafiya-card__icon">✨</div>
              <h3>Quality Focused</h3>
              <p>We focus on quality and consistency from processing to packaging.</p>
            </div>
          </div>

          {/* Invitation / See For Yourself Banner */}
          <div className="mill-invitation-banner">
            <div className="mill-invitation-banner__inner">
              <div className="mill-invitation-tag">
                <span>📍 Transparency First</span>
              </div>
              <h3 className="mill-invitation-title">
                Don&apos;t Just Take Our Word For It — Come See For Yourself.
              </h3>
              <p className="mill-invitation-desc">
                Visit our oil mill and witness how AAFIYA Cold Pressed Oils are prepared.
              </p>

              <div className="mill-invitation-pills">
                <div className="mill-pill">
                  <span className="mill-pill__icon">🚫</span>
                  <span>No Preservatives</span>
                </div>
                <div className="mill-pill">
                  <span className="mill-pill__icon">🧪</span>
                  <span>No Unnecessary Chemicals</span>
                </div>
                <div className="mill-pill mill-pill--accent">
                  <span className="mill-pill__icon">🌿</span>
                  <span>Just Carefully Selected Ingredients &amp; Cold Pressed Oil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="enquiry" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Enquire / Order</span>
            <h2>Request an Oil Enquiry</h2>
          </div>

          <form className="card enquiry-form" onSubmit={handleSubmit}>
            <div className="grid grid--2">
              <div className="form-field">
                <label>Select Oil *</label>
                <select name="productName" value={form.productName} onChange={handleChange} required>
                  <option value="">-- Choose an oil --</option>
                  {staticProducts.map((p) => (
                    <option key={p._id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Package Size *</label>
                <select name="size" value={form.size} onChange={handleChange} required>
                  <option value="">-- Choose size --</option>
                  {(selectedProduct?.packageSizes || staticProducts[0].packageSizes).map((s) => (
                    <option key={s.size} value={s.size}>{s.size} (₹{s.price})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid--2">
              <div className="form-field">
                <label>Quantity *</label>
                <input type="number" min="1" name="quantity" value={form.quantity} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Phone Number *</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-field">
              <label>Your Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Delivery Address *</label>
              <textarea name="address" rows="2" value={form.address} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Additional Requirements</label>
              <textarea name="additionalRequirements" rows="2" value={form.additionalRequirements} onChange={handleChange} />
            </div>

            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
