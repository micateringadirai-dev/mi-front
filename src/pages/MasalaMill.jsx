import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { useCart } from '../context/CartContext.jsx';
import './BusinessPage.scss';

export default function MasalaMill() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    productName: '',
    quantityKg: '',
    customerName: '',
    phoneNumber: '',
    address: '',
    message: '',
  });

  useEffect(() => {
    api
      .get('/masala/products')
      .then((res) => setProducts(res.data.data))
      .catch(() => toast.error('Could not load masala products'));
  }, []);

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
            <a href="#enquiry" className="btn btn--primary">
              Order Custom Blend
            </a>
            <a href="tel:+919629533887" className="btn btn--outline">
              📞 +91 96295 33887
            </a>
          </div>
        </div>
      </header>

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

      <section className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Masala Products</span>
            <h2>Available Spice Varieties</h2>
          </div>
          <div className="grid grid--3">
            {products.length === 0 && <p style={{ textAlign: 'center' }}>Products will be listed here once added by the admin.</p>}
            {products.map((p) => (
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

      <section id="enquiry" className="section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Enquire / Order</span>
            <h2>Request a Masala Enquiry</h2>
            <p>Tell us what you need, and our team will call to confirm your order.</p>
          </div>

          <form className="card enquiry-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Select Masala *</label>
              <select name="productName" value={form.productName} onChange={handleChange} required>
                <option value="">-- Choose a masala --</option>
                {products.map((p) => (
                  <option key={p._id} value={p.name}>{p.name}</option>
                ))}
                <option value="Other / Custom Blend">Other / Custom Blend</option>
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

            <div className="form-field">
              <label>Your Name *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Address *</label>
              <textarea name="address" rows="2" value={form.address} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Message</label>
              <textarea name="message" rows="2" value={form.message} onChange={handleChange} />
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
