import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { useCart } from '../context/CartContext.jsx';
import './BusinessPage.scss';

const defaultMasalaProducts = [
  {
    _id: 'chilli-sample',
    name: 'Chilli Powder',
    description: 'Freshly stone-ground from premium dried whole red chillies. Rich natural aroma and authentic flavor without chemicals.',
    pricePerKg: 250,
    availableQuantityKg: 50,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600'],
  },
  {
    _id: 'coriander-sample',
    name: 'Coriander Powder (Malli Thool)',
    description: 'Slow ground roasted whole coriander seeds, retaining pure natural essential oils and fragrant citrus notes.',
    pricePerKg: 220,
    availableQuantityKg: 40,
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&sat=-15'],
  },
  {
    _id: 'turmeric-sample',
    name: 'Salem Turmeric Powder',
    description: 'High curcumin golden Salem turmeric fingers stone-ground for rich medicinal aroma and pure quality.',
    pricePerKg: 280,
    availableQuantityKg: 35,
    images: ['https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=600'],
  },
];

const defaultGrindingServices = [
  {
    _id: 'grind-1',
    name: 'Dry Red Chilli (சிகப்பு மிளகாய்)',
    category: 'Spices',
    grindingType: 'Fine Powder Grinding',
    pricePerKg: 25,
    minQuantityKg: 1,
    notes: 'Sun-dried chillies without moisture. Stalks removed for rich color & pungency.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600',
    isActive: true,
  },
  {
    _id: 'grind-2',
    name: 'Coriander Seeds / Dhania (மல்லி)',
    category: 'Spices',
    grindingType: 'Fine Powder Grinding',
    pricePerKg: 25,
    minQuantityKg: 1,
    notes: 'Cleaned and crisp sun-dried whole coriander seeds.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&sat=-15',
    isActive: true,
  },
  {
    _id: 'grind-3',
    name: 'Salem Turmeric Roots / Manjal (மஞ்சள்)',
    category: 'Spices',
    grindingType: 'Pounding & Fine Milling',
    pricePerKg: 35,
    minQuantityKg: 1,
    notes: 'Crisp dry turmeric fingers. Machine pounded and stone ground for pure medicinal golden quality.',
    image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?q=80&w=600',
    isActive: true,
  },
  {
    _id: 'grind-4',
    name: 'Sambar & Kulambu Masala Blend (சாம்பார் மசாலா)',
    category: 'Blends',
    grindingType: 'Traditional Stone Grinding',
    pricePerKg: 30,
    minQuantityKg: 1,
    notes: 'Bring your roasted family spice blend ingredients. Milled to perfect aromatic consistency.',
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=600',
    isActive: true,
  },
  {
    _id: 'grind-5',
    name: 'Cumin & Black Pepper (சீரகம் & மிளகு)',
    category: 'Spices',
    grindingType: 'Fine or Coarse Texture',
    pricePerKg: 35,
    minQuantityKg: 0.5,
    notes: 'Low heat milling to preserve volatile natural essential oils.',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?q=80&w=600',
    isActive: true,
  },
  {
    _id: 'grind-6',
    name: 'Idli / Dosa Podi (இட்லி மிளகாய் பொடி)',
    category: 'Blends',
    grindingType: 'Authentic Coarse Crushing',
    pricePerKg: 25,
    minQuantityKg: 1,
    notes: 'Roasted dal, curry leaves, and red chillies crushed to crunchy authentic texture.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=600',
    isActive: true,
  },
  {
    _id: 'grind-7',
    name: 'Whole Wheat / Ragi / Rice (கோதுமை & மாவு அரைவை)',
    category: 'Grains & Flours',
    grindingType: 'Smooth Flour Milling',
    pricePerKg: 15,
    minQuantityKg: 2,
    notes: 'Clean whole grains milled fresh without overheating or nutrient loss.',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600',
    isActive: true,
  },
];

export default function MasalaMill() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(defaultMasalaProducts);
  const [grindingServices, setGrindingServices] = useState(defaultGrindingServices);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Grinding Calculator State
  const [calcSpiceId, setCalcSpiceId] = useState('');
  const [calcKg, setCalcKg] = useState('2');
  const [grindCategory, setGrindCategory] = useState('All');

  const [form, setForm] = useState({
    productName: '',
    quantityKg: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    message: '',
  });

  // Load products
  useEffect(() => {
    api
      .get('/masala/products')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setProducts(res.data.data);
        }
      })
      .catch((err) => console.warn('Could not load live masala products, using defaults:', err.message));
  }, []);

  // Load grinding services
  useEffect(() => {
    api
      .get('/masala/grinding-services')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setGrindingServices(res.data.data);
          if (!calcSpiceId) {
            setCalcSpiceId(res.data.data[0]._id);
          }
        }
      })
      .catch((err) => console.warn('Could not load grinding services, using defaults:', err.message));
  }, []);

  // Set default selected spice for calculator
  useEffect(() => {
    if (!calcSpiceId && grindingServices.length > 0) {
      setCalcSpiceId(grindingServices[0]._id);
    }
  }, [calcSpiceId, grindingServices]);

  const selectedGrindSpice = useMemo(() => {
    return grindingServices.find((s) => s._id === calcSpiceId) || grindingServices[0];
  }, [grindingServices, calcSpiceId]);

  const calculatedTotalFee = useMemo(() => {
    if (!selectedGrindSpice) return 0;
    const kg = parseFloat(calcKg) || 0;
    return Math.round(kg * (selectedGrindSpice.pricePerKg || 0));
  }, [selectedGrindSpice, calcKg]);

  const filteredGrindServices = useMemo(() => {
    if (grindCategory === 'All') return grindingServices;
    return grindingServices.filter((s) => s.category === grindCategory);
  }, [grindingServices, grindCategory]);

  const handleSelectSpiceForCalc = (spice) => {
    setCalcSpiceId(spice._id);
    const element = document.getElementById('grind-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleApplyToEnquiry = (spice, weight) => {
    const itemLabel = `Grinding Service: ${spice?.name || 'Custom Spice'} (${weight} kg)`;
    setForm((prev) => ({
      ...prev,
      productName: itemLabel,
      quantityKg: weight,
      message: `Enquiring for customer spice grinding service at your shop for ${spice?.name || 'spices'}. Estimated total: ₹${calculatedTotalFee}.`,
    }));
    toast.success(`Selected "${spice?.name}" for enquiry!`);
    const enquiryEl = document.getElementById('enquiry');
    if (enquiryEl) {
      enquiryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getWhatsAppGrindLink = () => {
    const spiceName = selectedGrindSpice ? selectedGrindSpice.name : 'Spices';
    const kg = calcKg || '1';
    const total = calculatedTotalFee;
    const msg = `Hello Ibrahim Masala Mill, I want to bring my raw spices for grinding at your shop:\n\n🌿 Spice: ${spiceName}\n⚖️ Weight: ${kg} kg\n💰 Estimated Grinding Fee: ₹${total}\n\nPlease let me know your shop timing and when I can bring them!`;
    return `https://wa.me/919629533887?text=${encodeURIComponent(msg)}`;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName || !form.quantityKg || !form.customerName || !form.phoneNumber || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/masala/enquiries', form);
      toast.success('Thank you! Your enquiry has been received.');
      setForm({
        productName: '',
        quantityKg: '',
        customerName: '',
        phoneNumber: '',
        address: '',
        message: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="business-page business-page--masala">
      <div className="fssai-badge">
        <span className="fssai-badge__label">FSSAI Registered</span>
        <span className="fssai-badge__number">Lic. # 12423008000456</span>
      </div>

      <header className="business-hero">
        <div className="container">
          <span className="eyebrow">Ibrahim Masala Mill</span>
          <RevealText as="h1">Stone-Ground Authenticity</RevealText>
          <p>
            Pure, stone-ground masalas with no adulteration. Traditional spices milled fresh to
            preserve natural oils, aroma, and color.
          </p>
          <div className="business-hero__ctas">
            <a href="#grinding-service" className="btn btn--primary" style={{ background: '#d97706', borderColor: '#d97706' }}>
              ⚙️ Bring &amp; Grind Service
            </a>
            <a href="#products" className="btn btn--outline">
              🧂 Buy Packed Masalas
            </a>
            <a href="tel:+919629533887" className="btn btn--outline">
              📞 +91 96295 33887
            </a>
          </div>
        </div>

        <div className="business-hero__curve" aria-hidden="true">
          <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C360,50 1080,50 1440,50 L1440,50 L0,50 Z"
              fill="#fdfbf7"
            />
          </svg>
        </div>
      </header>

      {/* PROCESS HIGHLIGHTS */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Pure &amp; Natural</span>
            <RevealText as="h2">Traditional Stone-Grinding</RevealText>
            <p>
              Unlike industrial high-speed mills that generate heat and destroy essential oils, our
              slow stone-grinding process retains the original flavor, pungency, and medicinal value
              of every spice.
            </p>
          </div>
          <div className="grid grid--2">
            {['Stone-Ground Process', 'Hygienic Handling', 'Quality Sourcing', 'Custom Blending'].map((c) => (
              <div className="card" key={c}><h3>{c}</h3></div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* CUSTOMER BRING & GRIND SERVICE SECTION */}
      {/* ========================================================== */}
      <section id="grinding-service" className="section section--grinding-service">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow-badge">⚙️ In-Shop Milling Service</span>
            <RevealText as="h2">Bring Your Own Spices &amp; Grind With Us</RevealText>
            <p className="section-subtitle">
              வாடிக்கையாளர்கள் தங்கள் சொந்த மசாலா பொருட்களை கடைக்கு கொண்டு வந்து சுத்தமாகவும் சுகாதாரமாகவும் அரைத்துக் கொள்ளலாம்!
              <br />
              Bring your dried red chillies, coriander, turmeric roots, or custom family sambar blend. We grind and crush them right in front of you with traditional low-heat stone mills and heavy-duty pulverizers.
            </p>
          </div>

          {/* 4-STEP PROCESS CARDS */}
          <div className="grid grid--4 grind-steps-grid">
            <div className="card grind-step-card">
              <div className="step-num">01</div>
              <div className="step-icon">☀️</div>
              <h4>Sun-Dry &amp; Clean</h4>
              <p>Thoroughly clean and sun-dry your raw spices at home to remove moisture for best aromatic aroma.</p>
            </div>
            <div className="card grind-step-card">
              <div className="step-num">02</div>
              <div className="step-icon">🏬</div>
              <h4>Bring To Our Mill</h4>
              <p>Bring any quantity to our Ibrahim Masala Mill shop in Karaikudi. We weigh accurately in your presence.</p>
            </div>
            <div className="card grind-step-card">
              <div className="step-num">03</div>
              <div className="step-icon">⚙️</div>
              <h4>Pick Your Texture</h4>
              <p>Choose fine powder, coarse crushing, or traditional stone pounding depending on your cooking preference.</p>
            </div>
            <div className="card grind-step-card">
              <div className="step-num">04</div>
              <div className="step-icon">🌿</div>
              <h4>Fresh &amp; 100% Pure</h4>
              <p>Ground fresh before you with zero additives, zero color, and 100% original aroma and freshness preserved.</p>
            </div>
          </div>

          {/* CATEGORY FILTER TABS */}
          <div className="grind-category-tabs">
            {['All', 'Spices', 'Blends', 'Grains & Flours'].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`grind-tab-btn ${grindCategory === cat ? 'is-active' : ''}`}
                onClick={() => setGrindCategory(cat)}
              >
                {cat === 'All' ? '🌟 All Spices & Grains' : cat === 'Spices' ? '🌶️ Raw Spices' : cat === 'Blends' ? '🥘 Masala Blends' : '🌾 Flours & Grains'}
              </button>
            ))}
          </div>

          {/* RATE CARD GRID */}
          <div className="grid grid--3 grind-rates-grid">
            {filteredGrindServices.map((service) => (
              <div
                className={`card grind-rate-card ${calcSpiceId === service._id ? 'is-selected' : ''}`}
                key={service._id}
              >
                <div
                  className="grind-rate-card__img"
                  style={{
                    backgroundImage: `url(${service.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600'})`,
                  }}
                >
                  <span className="grind-type-pill">{service.grindingType}</span>
                </div>

                <div className="grind-rate-card__content">
                  <div className="grind-rate-card__header">
                    <h3 className="spice-title">{service.name}</h3>
                    <span className="category-tag">{service.category || 'Spices'}</span>
                  </div>

                  {service.notes && <p className="spice-notes">💡 {service.notes}</p>}

                  <div className="grind-rate-card__pricing">
                    <div className="rate-price">
                      <span className="currency">₹</span>
                      <strong className="amount">{service.pricePerKg}</strong>
                      <span className="unit">/ kg</span>
                    </div>
                    <span className="min-weight-tag">Min {service.minQuantityKg || 1} kg</span>
                  </div>

                  <div className="grind-rate-card__actions">
                    <button
                      type="button"
                      className="btn btn--outline btn--sm btn-select-rate"
                      onClick={() => handleSelectSpiceForCalc(service)}
                    >
                      ⚡ Calculate Cost
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--sm btn-quick-enquiry"
                      onClick={() => handleApplyToEnquiry(service, service.minQuantityKg || 1)}
                    >
                      📝 Inquire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ========================================================== */}
          {/* INTERACTIVE GRINDING COST CALCULATOR & WHATSAPP WIDGET */}
          {/* ========================================================== */}
          <div id="grind-calculator" className="grind-calculator-card">
            <div className="calculator-header">
              <div className="calc-badge">⚡ Instant Cost Estimator</div>
              <h3>Calculate Your Spice Grinding Fee</h3>
              <p>Select the spice you want to grind, enter the quantity in kilograms, and see the exact grinding charge.</p>
            </div>

            <div className="calculator-grid">
              <div className="calculator-inputs">
                <div className="form-field">
                  <label>Select Spice / Grain</label>
                  <select
                    value={calcSpiceId}
                    onChange={(e) => setCalcSpiceId(e.target.value)}
                    className="calc-select"
                  >
                    {grindingServices.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} — ₹{s.pricePerKg}/kg ({s.grindingType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Quantity to Grind (in Kilograms)</label>
                  <div className="calc-quantity-wrapper">
                    <input
                      type="number"
                      step="0.5"
                      min={selectedGrindSpice?.minQuantityKg || 0.5}
                      value={calcKg}
                      onChange={(e) => setCalcKg(e.target.value)}
                      className="calc-input"
                    />
                    <span className="calc-kg-suffix">KG</span>
                  </div>

                  {/* QUICK KG PRESET BUTTONS */}
                  <div className="quick-kg-chips">
                    {[1, 2, 5, 10, 20].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`kg-chip ${parseFloat(calcKg) === preset ? 'active' : ''}`}
                        onClick={() => setCalcKg(String(preset))}
                      >
                        {preset} kg
                      </button>
                    ))}
                  </div>
                </div>

                {selectedGrindSpice?.notes && (
                  <div className="calculator-instructions">
                    <strong>📌 Preparation Tip:</strong> {selectedGrindSpice.notes}
                  </div>
                )}
              </div>

              {/* CALCULATOR OUTPUT BOX */}
              <div className="calculator-summary">
                <div className="summary-box">
                  <div className="summary-item">
                    <span>Selected Item:</span>
                    <strong>{selectedGrindSpice?.name || 'Selected Spice'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Milling Style:</span>
                    <span>{selectedGrindSpice?.grindingType || 'Fine Powder'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Grinding Rate:</span>
                    <span>₹{selectedGrindSpice?.pricePerKg || 0} / kg</span>
                  </div>
                  <div className="summary-item">
                    <span>Total Weight:</span>
                    <span>{calcKg || 0} kg</span>
                  </div>

                  <hr className="summary-divider" />

                  <div className="summary-total">
                    <span className="total-label">Estimated Grinding Cost</span>
                    <div className="total-price">
                      <span className="currency">₹</span>
                      <strong className="total-amount">{calculatedTotalFee}</strong>
                    </div>
                  </div>

                  <div className="calculator-cta-buttons">
                    <a
                      href={getWhatsAppGrindLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--whatsapp-grind"
                    >
                      <span>💬 Book via WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      className="btn btn--outline-dark"
                      onClick={() => handleApplyToEnquiry(selectedGrindSpice, calcKg)}
                    >
                      <span>📝 Fill Online Enquiry</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* PACKAGED MASALA PRODUCTS */}
      {/* ========================================================== */}
      <section id="products" className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Ready-Made Spice Products</span>
            <h2>Our Ready Packed Masalas</h2>
            <p>Freshly stone-ground packaged spices ready for purchase with instant home delivery or in-store pickup.</p>
          </div>
          <div className="grid grid--3">
            {(Array.isArray(products) ? products : defaultMasalaProducts).map((p) => (
              <div className="card product-card" key={p._id}>
                <div
                  className="product-card__img"
                  style={{ backgroundImage: `url(${p.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600'})` }}
                  onClick={() => setSelectedProduct(p)}
                />
                <h3 onClick={() => setSelectedProduct(p)}>
                  {p.name}
                </h3>
                <p className="product-card__desc">{p.description}</p>
                <div className="product-card__meta">
                  <span className="price-tag">₹{p.pricePerKg}/kg</span>
                  <span className="stock-tag">{p.availableQuantityKg}kg available</span>
                </div>
                <div className="product-card__actions">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm btn-view-details"
                    onClick={() => setSelectedProduct(p)}
                  >
                    👁️ View Details
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--sm btn-add-cart"
                    onClick={() =>
                      addToCart(p, 1, {
                        unit: 'kg',
                        price: p.pricePerKg,
                        business: 'Ibrahim Masala Mill',
                      })
                    }
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ========================================================== */}
      {/* ENQUIRY / ORDER FORM */}
      {/* ========================================================== */}
      <section id="enquiry" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Enquire / Order</span>
            <h2>Request a Masala or Grinding Enquiry</h2>
            <p>Tell us what you need, and our team will call to confirm your order or grinding slot.</p>
          </div>

          <form className="card enquiry-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Select Product / Service *</label>
              <select name="productName" value={form.productName} onChange={handleChange} required>
                <option value="">-- Choose a product or grinding service --</option>
                
                <optgroup label="Packaged Masala Powders (Buy Ready)">
                  {products.map((p) => (
                    <option key={p._id} value={p.name}>
                      {p.name} (₹{p.pricePerKg}/kg)
                    </option>
                  ))}
                </optgroup>

                <optgroup label="Bring & Grind Service (Milling Charge Per Kg)">
                  {grindingServices.map((g) => (
                    <option key={g._id} value={`Grinding Service: ${g.name}`}>
                      ⚙️ {g.name} — Grinding Fee ₹{g.pricePerKg}/kg
                    </option>
                  ))}
                </optgroup>

                <option value="Other / Custom Blend">Other / Custom Blend or Bulk Milling</option>
              </select>
            </div>

            <div className="grid grid--2">
              <div className="form-field">
                <label>Quantity Required (kg) *</label>
                <input type="number" min="0.5" step="0.5" name="quantityKg" value={form.quantityKg} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Phone Number *</label>
                <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid--2">
              <div className="form-field">
                <label>Your Name *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Address / Location *</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. Karaikudi, Devakottai, etc." required />
              </div>
            </div>

            <div className="form-field">
              <label>Message / Special Milling Request</label>
              <textarea
                name="message"
                rows="2"
                value={form.message}
                onChange={handleChange}
                placeholder="Specify preferred grinding texture (fine, coarse) or appointment time..."
              />
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
