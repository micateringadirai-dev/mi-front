import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import './BusinessPage.scss';

export default function MasalaMill() {
  const [products, setProducts] = useState([]);
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
      toast.success('Enquiry submitted! Our team will contact you to confirm.');
      setForm({ productName: '', quantityKg: '', customerName: '', phoneNumber: '', address: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="business-page business-page--masala">
      <section className="business-hero">
        <div className="container">
          <span className="eyebrow">Ibrahim Masala Mill</span>
          <h1>Freshly Stone-Ground Spices, The Traditional Way</h1>
          <p>No fillers. No shortcuts. Just pure, aromatic masala milled fresh to order.</p>
          <div className="business-hero__ctas">
            <a href="#enquiry" className="btn btn--primary">Enquire Now</a>
            <a href="tel:+919000000000" className="btn btn--outline">Call Mill</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2">
          <div>
            <span className="eyebrow">About the Mill</span>
            <RevealText as="h2">Generations of Milling Craft</RevealText>
            <p>
              Ibrahim Masala Mill uses traditional stone-grinding machinery combined with modern
              hygiene standards to produce chemical-free, full-flavored masala powders — chilli,
              turmeric, coriander, garam masala, and custom spice blends.
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
                <div className="product-card__img" style={{ backgroundImage: `url(${p.images?.[0] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600'})` }} />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price-tag">₹{p.pricePerKg}/kg · {p.availableQuantityKg}kg available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
