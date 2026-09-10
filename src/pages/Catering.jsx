import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/client';
import RevealText from '../components/RevealText.jsx';
import miCateringLogo from '../assets/mi-catering-logo.png';
import './BusinessPage.scss';

const defaultEvents = [
  { _id: 'wedding-pkg', title: 'Grand Wedding Feast (Biryani / Traditional Meals)' },
  { _id: 'valima-pkg', title: 'Valima & Reception Buffet' },
  { _id: 'housewarming', title: 'Housewarming / Kudikoodal Catering' },
  { _id: 'corporate-pkg', title: 'Corporate Event / Conference Lunch' },
  { _id: 'family-pkg', title: 'Family Gathering & Special Functions' },
];

export default function Catering() {
  const [events, setEvents] = useState(defaultEvents);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemName: '',
    customerName: '',
    mobileNumber: '',
    numberOfPackets: '',
    orderDate: '',
    address: '',
    foodRequirements: '',
    additionalNotes: '',
  });

  useEffect(() => {
    api
      .get('/catering/events')
      .then((res) => {
        if (Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setEvents(res.data.data);
        } else {
          setEvents(defaultEvents);
        }
      })
      .catch((err) => {
        console.warn('Could not load live catering events, using default packages:', err.message);
        setEvents(defaultEvents);
      })
      .finally(() => setLoadingEvents(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || !form.customerName || !form.mobileNumber || !form.numberOfPackets || !form.orderDate || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/catering/orders', form);
      toast.success('Quotation request submitted! We will contact you shortly.');
      setForm({
        itemName: '',
        customerName: '',
        mobileNumber: '',
        numberOfPackets: '',
        orderDate: '',
        address: '',
        foodRequirements: '',
        additionalNotes: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="business-page business-page--catering">
      <section className="business-hero">
        <div className="container">
          {/* FSSAI license badge: absolute on desktop, clean centered pill on mobile */}
          <div className="fssai-badge">
            <span className="fssai-badge__label">FSSAI Lic. No.</span>
            <span className="fssai-badge__number">XXXXXXXXXXXXXXXX</span>
          </div>

          <div className="business-hero__logo-box">
            <img
              src={miCateringLogo}
              alt="MI Catering Services Logo"
              className="business-hero__logo"
            />
          </div>

          <span className="eyebrow">MI Catering Services</span>
          <h1>Authentic Flavors for Every Celebration</h1>
          <p>Weddings, housewarmings, corporate events &amp; daily catering — cooked with care.</p>
          <div className="business-hero__ctas">
            <a href="#quotation" className="btn btn--primary">Get a Quotation</a>
            <a href="tel:+919842096814" className="btn btn--outline">
              📞 +91 98420 96814
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--2">
          <div>
            <span className="eyebrow">About Us</span>
            <RevealText as="h2">Cooking With Tradition, Serving With Love</RevealText>
            <p>
              MI Catering Services has been crafting memorable dining experiences for weddings,
              housewarmings, and corporate gatherings. Our FSSAI-certified kitchen blends
              time-tested family recipes with hygienic, large-scale preparation to serve every
              event with consistent quality.
            </p>
          </div>
          <div className="grid grid--2">
            {['Weddings', 'Housewarmings', 'Corporate Events', 'Daily Tiffin Service'].map((c) => (
              <div className="card" key={c}><h3>{c}</h3></div>
            ))}
          </div>
        </div>
      </section>

      <section id="quotation" className="section section--alt">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Get Catering Quotation</span>
            <h2>Request an Order / Quotation</h2>
            <p>Select an available item or event, share your details, and we'll confirm with you.</p>
          </div>

          <form className="card quotation-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Select Item / Event *</label>
              {loadingEvents ? (
                <p>Loading available items...</p>
              ) : (
                <select name="itemName" value={form.itemName} onChange={handleChange} required>
                  <option value="">-- Choose an item / event --</option>
                  {(Array.isArray(events) ? events : defaultEvents).map((ev) => (
                    <option key={ev._id} value={ev.title}>
                      {ev.title} {ev.eventDate ? `— ${new Date(ev.eventDate).toDateString()}` : ''}
                    </option>
                  ))}
                  <option value="Custom Order">Custom Order (specify in notes)</option>
                </select>
              )}
            </div>

            <div className="grid grid--2">
              <div className="form-field">
                <label>Your Name *</label>
                <input name="customerName" value={form.customerName} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Mobile Number *</label>
                <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid--2">
              <div className="form-field">
                <label>Number of Packets / Persons *</label>
                <input type="number" min="1" name="numberOfPackets" value={form.numberOfPackets} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Order / Event Date *</label>
                <input type="date" name="orderDate" value={form.orderDate} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-field">
              <label>Delivery / Event Address *</label>
              <textarea name="address" rows="2" value={form.address} onChange={handleChange} required />
            </div>

            <div className="form-field">
              <label>Food Requirements</label>
              <textarea name="foodRequirements" rows="2" value={form.foodRequirements} onChange={handleChange} placeholder="e.g. Veg + Non-veg, spice level, allergies" />
            </div>

            <div className="form-field">
              <label>Additional Notes</label>
              <textarea name="additionalNotes" rows="2" value={form.additionalNotes} onChange={handleChange} />
            </div>

            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit & Confirm Request'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
