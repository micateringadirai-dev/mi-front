import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import './BusinessPage.scss';

export default function ColdPressOil() {
  const [products, setProducts] = useState([]);
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
      .then((res) => setProducts(res.data.data))
      .catch(() => toast.error('Could not load oil products'));
  }, []);

  const selectedProduct = products.find((p) => p.name === form.productName);

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

  const staticProducts = products.length
    ? products
    : [
        { _id: 'sesame', name: 'Sesame Oil (Nallennai)', description: 'Traditional wood-pressed sesame oil.', packageSizes: [{ size: '500ml', price: 250 }, { size: '1L', price: 480 }] },
        { _id: 'coconut', name: 'Coconut Oil', description: 'Pure cold-pressed coconut oil.', packageSizes: [{ size: '500ml', price: 200 }, { size: '1L', price: 380 }] },
        { _id: 'groundnut', name: 'Groundnut Oil', description: 'Wood-pressed groundnut oil, rich in flavor.', packageSizes: [{ size: '500ml', price: 220 }, { size: '1L', price: 420 }] },
      ];

  return (
    <div className="business-page business-page--oil">
      <section className="business-hero">
        <div className="container">
          <span className="eyebrow">Afia Cold Press Oil</span>
          <h1>Pure Wood-Pressed Chekku Oils</h1>
          <p>Traditional cold-press extraction — no heat, no chemicals, just pure nutrition.</p>
          <div className="business-hero__ctas">
            <a href="#enquiry" className="btn btn--primary">Enquire Now</a>
            <a href="tel:+919000000000" className="btn btn--outline">Call Us</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2">
          <div>
            <span className="eyebrow">Our Process</span>
            <RevealText as="h2">The Traditional Chekku Method</RevealText>
            <p>
              Afia Cold Press Oil is extracted using traditional wood ("chekku") presses that
              operate at low speed and low temperature, preserving natural nutrients, aroma, and
              flavor — completely free from chemical solvents or refining.
            </p>
          </div>
          <div className="grid grid--2">
            {['Wood/Chekku Pressed', 'No Chemicals Used', 'Cold Extraction', 'Lab-Tested Purity'].map((c) => (
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
            {staticProducts.map((p) => (
              <div className="card product-card" key={p._id}>
                <div className="product-card__img" style={{ backgroundImage: `url(${p.images?.[0] || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600'})` }} />
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <p className="price-tag">
                  {p.packageSizes?.map((s) => `${s.size}: ₹${s.price}`).join(' · ')}
                </p>
              </div>
            ))}
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
