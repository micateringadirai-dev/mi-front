export default function CateringQuotationForm({
  quotationForm,
  setQuotationForm,
  defaultPackages,
  submittingQuotation,
  onSubmitQuotation,
  onResetQuotation,
}) {
  return (
    <section id="quotation" className="section section--alt catering-quotation-section">
      <div className="container">
        <div className="section-heading text-center">
          <span className="eyebrow">MI Catering Quotation</span>
          <h2>Plan Your Grand Celebration Feast</h2>
          <p>
            Weddings, Valima, Housewarmings, Corporate Banquets &amp; Custom Menus. Share your
            event requirements below and our culinary coordinator will contact you promptly.
          </p>
        </div>

        <div className="quotation-single-container">
          <div className="card ordering-card quotation-card">
            <div className="ordering-card__header">
              <span className="ordering-badge ordering-badge--quotation">
                📋 Event Quotation
              </span>
              <h3>Grand Celebrations &amp; Custom Orders</h3>
              <p className="ordering-card__sub">
                Weddings, Valima, Housewarmings, Corporate Gatherings &amp; Custom Menus
              </p>
            </div>

            <form onSubmit={onSubmitQuotation} className="quotation-form-inner">
              <div className="form-field">
                <label>Select Catering Package / Event Type *</label>
                <select
                  value={quotationForm.itemName}
                  onChange={(e) =>
                    setQuotationForm({ ...quotationForm, itemName: e.target.value })
                  }
                  required
                >
                  {defaultPackages.map((pkg) => (
                    <option key={pkg._id} value={pkg.title}>
                      {pkg.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid--2">
                <div className="form-field">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={quotationForm.customerName}
                    onChange={(e) =>
                      setQuotationForm({ ...quotationForm, customerName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={quotationForm.mobileNumber}
                    onChange={(e) =>
                      setQuotationForm({ ...quotationForm, mobileNumber: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid--2">
                <div className="form-field">
                  <label>Expected Guests / Packets *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 150"
                    value={quotationForm.numberOfPackets}
                    onChange={(e) =>
                      setQuotationForm({ ...quotationForm, numberOfPackets: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={quotationForm.orderDate}
                    onChange={(e) =>
                      setQuotationForm({ ...quotationForm, orderDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-field delivery-preference-field">
                <label className="delivery-pref-label">Fulfillment Preference *</label>
                <div className="delivery-pref-options">
                  <button
                    type="button"
                    className={`delivery-pref-card ${
                      quotationForm.deliveryType === 'Delivery' ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      setQuotationForm((prev) => ({ ...prev, deliveryType: 'Delivery' }))
                    }
                  >
                    <div className="pref-icon">🚚</div>
                    <div className="pref-info">
                      <strong className="pref-title">Doorstep Delivery</strong>
                      <span className="pref-desc">Delivered hot to your venue</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`delivery-pref-card ${
                      quotationForm.deliveryType === 'Self Service' ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      setQuotationForm((prev) => ({ ...prev, deliveryType: 'Self Service' }))
                    }
                  >
                    <div className="pref-icon">🛍️</div>
                    <div className="pref-info">
                      <strong className="pref-title">Self Service (Kitchen Pickup)</strong>
                      <span className="pref-desc">Pickup from central kitchen</span>
                    </div>
                  </button>
                </div>
              </div>

              {quotationForm.deliveryType === 'Delivery' ? (
                <div className="form-field">
                  <label>Event Venue / Delivery Address *</label>
                  <textarea
                    rows="2"
                    placeholder="Full hall/venue address, street, landmark, village..."
                    value={quotationForm.address}
                    onChange={(e) =>
                      setQuotationForm({ ...quotationForm, address: e.target.value })
                    }
                    required
                  />
                </div>
              ) : (
                <div className="selfservice-kitchen-box">
                  <div className="kitchen-pin-icon">📍</div>
                  <div className="kitchen-details">
                    <strong>M I CATERING SERVICE (Pickup Counter)</strong>
                    <p>KALLUKOLLAI, Adirampattinam, Tamil Nadu 614701</p>
                    <div className="kitchen-actions-row">
                      <a
                        href="https://www.google.com/maps/dir//M+I+CATERING+SERVICE+-+ADIRAMPATTINAM,+KALLUKOLLAI,+Adirampattinam,+Tamil+Nadu+614701/@10.3417539,79.3690824,3427m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x3b0003e6ec626489:0xd2bfb2e7528a21a3!2m2!1d79.3752531!2d10.3475511?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="kitchen-directions-btn"
                      >
                        <span>🗺️</span> View on Google Maps &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-field">
                <label>Special Food Requirements (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Non-veg + Veg counter, spice preference, special dessert requests"
                  value={quotationForm.foodRequirements}
                  onChange={(e) =>
                    setQuotationForm({ ...quotationForm, foodRequirements: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Requested Add-ons / Extras (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Extra Chicken 65, Bread Halwa, Egg, Brinjal Dalcha"
                  value={quotationForm.customExtras}
                  onChange={(e) =>
                    setQuotationForm({ ...quotationForm, customExtras: e.target.value })
                  }
                />
              </div>

              <div className="form-field">
                <label>Additional Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Any specific timing, catering setup requirements, or questions..."
                  value={quotationForm.additionalNotes}
                  onChange={(e) =>
                    setQuotationForm({ ...quotationForm, additionalNotes: e.target.value })
                  }
                />
              </div>

              <div className="quotation-form-actions">
                <button
                  type="submit"
                  className="btn btn--primary btn--submit-quotation"
                  disabled={submittingQuotation}
                >
                  {submittingQuotation ? 'Submitting Request...' : 'Submit & Confirm Request'}
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn-clear-quotation"
                  onClick={onResetQuotation}
                  title="Clear and reset quotation form"
                >
                  ↺ Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
