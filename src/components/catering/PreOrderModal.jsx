export default function PreOrderModal({
  isOpen,
  onClose,
  selectedAnnouncement,
  preOrderQty,
  setPreOrderQty,
  preOrderExtras,
  updatePreOrderExtraQty,
  handleRemovePreOrderExtra,
  selectedExtrasList,
  unitPrice,
  portionUnit,
  mainDishSubtotal,
  originalSubtotal,
  discountType,
  discountValue,
  discountAmount,
  finalPayableTotal,
  preOrderForm,
  setPreOrderForm,
  submittingPreOrder,
  onSubmitPreOrder,
}) {
  if (!isOpen || !selectedAnnouncement) return null;

  const allowedPreOrderDelivery = selectedAnnouncement?.deliveryOption || 'Both';
  const showPreOrderDelivery =
    allowedPreOrderDelivery === 'Both' || allowedPreOrderDelivery === 'Delivery';
  const showPreOrderSelfService =
    allowedPreOrderDelivery === 'Both' || allowedPreOrderDelivery === 'Self Service';

  return (
    <div
      className="modal-backdrop preorder-modal-backdrop"
      onClick={onClose}
      data-lenis-prevent="true"
    >
      <div
        className="modal-card preorder-modal-card"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent="true"
      >
        <div className="modal-header preorder-modal-header">
          <div className="preorder-modal-header-meta">
            <div className="preorder-live-header" style={{ marginBottom: '0.2rem' }}>
              <span className="ordering-badge ordering-badge--preorder">
                <span className="live-dot"></span> Dynamic Pre-Order Active
              </span>
              <span className="preorder-date-tag">
                📅{' '}
                {new Date(selectedAnnouncement.eventDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h3>{selectedAnnouncement.title}</h3>
            <p className="ordering-card__sub">
              Reserve freshly prepared signature feast cooked on this announced date.
            </p>
          </div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            title="Close popup"
          >
            ✕
          </button>
        </div>

        <div className="modal-body preorder-modal-body" data-lenis-prevent="true">
          {/* PROMINENT PACKET SELECTION & QUANTITY CARD */}
          <div className="packet-selection-card">
            <div className="packet-card-header">
              <div className="packet-main-info">
                <span className="packet-badge">🍱 Step 1: Select Packets</span>
                <h4 className="packet-dish-title">{selectedAnnouncement.title}</h4>
                <span className="packet-rate-tag">
                  ₹{unitPrice.toLocaleString('en-IN')} / {portionUnit || 'Packet'}
                </span>
              </div>
              {Array.isArray(selectedAnnouncement.menuItems) &&
                selectedAnnouncement.menuItems.length > 0 && (
                  <div className="packet-includes-pills">
                    <span className="includes-label">Feast Includes:</span>
                    {selectedAnnouncement.menuItems.map((item, idx) => (
                      <span key={idx} className="menu-pill">
                        ✦ {item}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            {/* QUICK PACKET PRESET CHIPS */}
            <div className="packet-quick-select-row">
              <span className="quick-label">Quick Select Packets:</span>
              <div className="quick-chips-wrap">
                {[1, 2, 3, 4, 5, 10].map((num) => {
                  const minP = selectedAnnouncement.minPackets || 1;
                  if (num < minP) return null;
                  return (
                    <button
                      key={num}
                      type="button"
                      className={`btn-packet-chip ${preOrderQty === num ? 'is-active' : ''}`}
                      onClick={() => setPreOrderQty(num)}
                    >
                      {num} {num === 1 ? (portionUnit || 'Packet') : `${portionUnit || 'Packet'}s`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INTERACTIVE STEPPER, INPUT & CALCULATION */}
            <div className="packet-stepper-calc-row">
              <div className="packet-stepper-tool">
                <button
                  type="button"
                  className="btn-stepper-circle btn-stepper-minus"
                  onClick={() =>
                    setPreOrderQty(
                      Math.max(selectedAnnouncement.minPackets || 1, preOrderQty - 1)
                    )
                  }
                  disabled={preOrderQty <= (selectedAnnouncement.minPackets || 1)}
                  title="Decrease packets"
                >
                  –
                </button>
                <div className="packet-input-box">
                  <input
                    type="number"
                    min={selectedAnnouncement.minPackets || 1}
                    max={500}
                    value={preOrderQty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setPreOrderQty(Math.max(selectedAnnouncement.minPackets || 1, val));
                      }
                    }}
                    className="packet-qty-input"
                    title="Enter exact number of packets"
                  />
                  <span className="packet-sublabel">{portionUnit || 'Packets'}</span>
                </div>
                <button
                  type="button"
                  className="btn-stepper-circle btn-stepper-plus"
                  onClick={() => setPreOrderQty(preOrderQty + 1)}
                  title="Increase packets"
                >
                  +
                </button>
              </div>

              <div className="packet-price-summary-tag">
                <span className="formula">
                  ₹{unitPrice} × {preOrderQty} {portionUnit || 'Packet'}{preOrderQty > 1 ? 's' : ''}
                </span>
                <strong className="amount">
                  = ₹{mainDishSubtotal.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* CONFIGURED ADD-ONS & SIDES WITH GRAMMAGE */}
          {Array.isArray(selectedAnnouncement.extraSideDishes) &&
            selectedAnnouncement.extraSideDishes.length > 0 && (
              <div className="preorder-addons-section">
                <div className="addons-header-row">
                  <h5>🍗 Optional Sides &amp; Add-ons</h5>
                  <span className="addons-hint">Custom portions &amp; rates</span>
                </div>
                <div className="addons-grid">
                  {selectedAnnouncement.extraSideDishes.map((extra, idx) => {
                    const qty = preOrderExtras[extra.name] || 0;
                    return (
                      <div
                        key={idx}
                        className={`preorder-addon-card ${qty > 0 ? 'is-selected' : ''}`}
                      >
                        <div className="addon-meta">
                          <strong className="addon-name">{extra.name}</strong>
                          {extra.portion && (
                            <span className="addon-portion-tag">
                              ⚖️ {extra.portion}
                            </span>
                          )}
                          <span className="addon-price">
                            +₹{extra.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="addon-stepper">
                          {qty > 0 ? (
                            <div className="stepper-mini-group">
                              <div className="stepper-mini">
                                <button
                                  type="button"
                                  onClick={() => updatePreOrderExtraQty(extra.name, -1)}
                                  title="Decrease"
                                >
                                  –
                                </button>
                                <span>{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => updatePreOrderExtraQty(extra.name, 1)}
                                  title="Increase"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                type="button"
                                className="btn-unselect-addon"
                                onClick={() => handleRemovePreOrderExtra(extra.name)}
                                title={`Unselect ${extra.name}`}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn-add-addon"
                              onClick={() => updatePreOrderExtraQty(extra.name, 1)}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* AUTOMATIC PROMOTIONAL WEB DISCOUNT CALLOUT */}
          {discountAmount > 0 && (
            <div className="preorder-promo-banner">
              <div className="promo-badge-icon">🎉</div>
              <div className="promo-badge-text">
                <strong>Web Promotional Offer Applied!</strong>
                <span>
                  {discountType === 'percentage'
                    ? `Enjoy an instant ${discountValue}% discount on this online pre-order.`
                    : `Enjoy an instant flat ₹${discountValue} discount on this pre-order.`}
                </span>
              </div>
              <span className="promo-savings-tag">
                -₹{discountAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {/* LIVE ORDER BILL BREAKDOWN */}
          <div className="preorder-bill-card">
            <div className="bill-row">
              <span>
                {preOrderQty} × {selectedAnnouncement.title} ({portionUnit}):
              </span>
              <span>₹{mainDishSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {selectedExtrasList.map((item, idx) => (
              <div key={idx} className="bill-row bill-row--extra">
                <span className="extra-bill-label">
                  + {item.name} {item.portion ? `(${item.portion})` : ''} (×{item.quantity})
                  <button
                    type="button"
                    className="btn-bill-remove-extra"
                    onClick={() => handleRemovePreOrderExtra(item.name)}
                    title={`Unselect / remove ${item.name}`}
                  >
                    ✕
                  </button>
                </span>
                <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
              </div>
            ))}

            {discountAmount > 0 && (
              <>
                <div className="bill-row bill-row--subtotal">
                  <span>Original Price:</span>
                  <span className="strikethrough-price">
                    ₹{originalSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bill-row bill-row--discount">
                  <span>
                    Promotional Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Flat'}):
                  </span>
                  <span className="discount-minus">
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}

            <div className="bill-row bill-row--final">
              <strong>Final Payable Total:</strong>
              <strong className="final-payable-highlight">
                ₹{finalPayableTotal.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* PRE-ORDER CUSTOMER DETAILS & FULFILLMENT FORM */}
          <form onSubmit={onSubmitPreOrder} className="preorder-customer-form" id="preorder-modal-form">
            <div className="grid grid--2">
              <div className="form-field">
                <label>Your Name *</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={preOrderForm.customerName}
                  onChange={(e) =>
                    setPreOrderForm({ ...preOrderForm, customerName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-field">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={preOrderForm.mobileNumber}
                  onChange={(e) =>
                    setPreOrderForm({ ...preOrderForm, mobileNumber: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* FULFILLMENT METHOD */}
            <div className="form-field delivery-preference-field">
              <label className="delivery-pref-label">
                Fulfillment Method *
                {allowedPreOrderDelivery === 'Self Service' && (
                  <span className="pref-restriction-note">
                    (🛍️ Central Kitchen Pickup Only)
                  </span>
                )}
                {allowedPreOrderDelivery === 'Delivery' && (
                  <span className="pref-restriction-note">
                    (🚚 Doorstep Delivery Only)
                  </span>
                )}
              </label>
              <div
                className={`delivery-pref-options ${
                  allowedPreOrderDelivery !== 'Both' ? 'delivery-pref-options--single' : ''
                }`}
              >
                {showPreOrderDelivery && (
                  <button
                    type="button"
                    className={`delivery-pref-card ${
                      preOrderForm.deliveryType === 'Delivery' ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      setPreOrderForm((prev) => ({ ...prev, deliveryType: 'Delivery' }))
                    }
                  >
                    <div className="pref-icon">🚚</div>
                    <div className="pref-info">
                      <strong className="pref-title">Doorstep Delivery</strong>
                      <span className="pref-desc">Hot delivered to your home</span>
                    </div>
                  </button>
                )}

                {showPreOrderSelfService && (
                  <button
                    type="button"
                    className={`delivery-pref-card ${
                      preOrderForm.deliveryType === 'Self Service' ? 'is-selected' : ''
                    }`}
                    onClick={() =>
                      setPreOrderForm((prev) => ({
                        ...prev,
                        deliveryType: 'Self Service',
                      }))
                    }
                  >
                    <div className="pref-icon">🛍️</div>
                    <div className="pref-info">
                      <strong className="pref-title">
                        Self Service (Kitchen Pickup)
                      </strong>
                      <span className="pref-desc">Pickup hot at central kitchen</span>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {preOrderForm.deliveryType === 'Delivery' ? (
              <div className="form-field">
                <label>Doorstep Delivery Address *</label>
                <textarea
                  rows="2"
                  placeholder="Door / Flat No, Street name, Landmark, Village / Town..."
                  value={preOrderForm.address}
                  onChange={(e) =>
                    setPreOrderForm({ ...preOrderForm, address: e.target.value })
                  }
                  required
                />
              </div>
            ) : (
              <div className="selfservice-kitchen-box" style={{ marginBottom: '1rem' }}>
                <div className="kitchen-pin-icon">📍</div>
                <div className="kitchen-details">
                  <strong>MI Catering Central Kitchen (Pickup Counter)</strong>
                  <p>Main Road, Adirampattinam, Tamil Nadu 614701</p>
                  <span className="kitchen-status">
                    ✓ Your packets will be freshly packed &amp; labeled with your name on cooking day.
                  </span>
                </div>
              </div>
            )}

            <div className="form-field">
              <label>Pickup / Delivery Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Will collect around 1:00 PM / Brother collecting"
                value={preOrderForm.additionalNotes}
                onChange={(e) =>
                  setPreOrderForm({ ...preOrderForm, additionalNotes: e.target.value })
                }
              />
            </div>
          </form>
        </div>

        <div className="modal-footer preorder-modal-footer">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onClose}
            disabled={submittingPreOrder}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="preorder-modal-form"
            className="btn btn--primary btn--preorder-submit"
            disabled={submittingPreOrder}
          >
            {submittingPreOrder
              ? 'Confirming Pre-Order...'
              : `Confirm Pre-Order • ₹${finalPayableTotal.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
