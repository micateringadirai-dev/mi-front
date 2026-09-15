import { motion } from 'framer-motion';
import RevealText from '../RevealText.jsx';

export default function CookingAnnouncements({
  cookingAnnouncements,
  selectedAnnouncement,
  onToggleSelectAnnouncement,
  onSelectAnnouncement,
}) {
  return (
    <section id="cooking-announcements" className="section cooking-announcements-section">
      <span id="special-event" style={{ position: 'relative', top: '-90px', display: 'block' }} aria-hidden="true" />
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">📢 Special Events &amp; Cooking Days</span>
          <RevealText as="h2">Scheduled Feasts &amp; Ongoing Pre-Orders</RevealText>
          <p>
            On announced dates, our traditional kitchen prepares special signature feasts. Pre-order
            your packets in advance before cooking starts!
          </p>
        </div>

        {cookingAnnouncements.length > 0 ? (
          <div className="grid grid--3 announcements-grid">
            {cookingAnnouncements.map((ann) => {
              const evDate = new Date(ann.eventDate);
              const dayOfWeek = evDate.toLocaleDateString('en-IN', { weekday: 'short' });
              const dateNum = evDate.getDate();
              const monthStr = evDate.toLocaleDateString('en-IN', { month: 'short' });
              const isSelected = selectedAnnouncement?._id === ann._id;

              return (
                <motion.div
                  key={ann._id}
                  className={`announcement-card ${isSelected ? 'is-selected' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  onClick={() => onToggleSelectAnnouncement(ann)}
                  style={{ cursor: 'pointer' }}
                  title="Click to pre-order this feast (opens popup form)"
                >
                  <div className="announcement-card__header">
                    <div className="date-badge">
                      <span className="date-badge__day">{dayOfWeek}</span>
                      <span className="date-badge__num">{dateNum}</span>
                      <span className="date-badge__month">{monthStr}</span>
                    </div>
                    <div className="status-pill">
                      <span className="live-dot"></span> Pre-Orders Open
                    </div>
                  </div>

                  {ann.images?.[0] && (
                    <div
                      className="announcement-card__banner"
                      style={{ backgroundImage: `url(${ann.images[0]})` }}
                    />
                  )}

                  <div className="announcement-card__body">
                    <span className="announcement-category">
                      {ann.category ? ann.category.replace('-', ' ') : 'Special Event'}
                    </span>
                    <h3 className="announcement-title">{ann.title}</h3>
                    {ann.description && (
                      <p className="announcement-desc">{ann.description}</p>
                    )}

                    {Array.isArray(ann.menuItems) && ann.menuItems.length > 0 && (
                      <div className="menu-items-box">
                        <span className="menu-items-label">Includes in this feast:</span>
                        <div className="menu-tags">
                          {ann.menuItems.map((item, idx) => (
                            <span key={idx} className="menu-tag">
                              ✦ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(ann.extraSideDishes) && ann.extraSideDishes.length > 0 && (
                      <div className="extra-dishes-box">
                        <span className="extra-dishes-label">✨ Extra Add-ons available:</span>
                        <div className="extra-tags">
                          {ann.extraSideDishes.map((ex, idx) => (
                            <span key={idx} className="extra-tag">
                              🍗 {ex.name} {ex.portion ? `(${ex.portion})` : ''} {ex.price > 0 ? `(+₹${ex.price})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="announcement-card__pricing">
                      {ann.pricePerPacket > 0 ? (
                        <div className="price-box">
                          <span className="price-amount">₹{ann.pricePerPacket}</span>
                          <span className="price-unit">/ {ann.portionUnit || 'packet'}</span>
                        </div>
                      ) : (
                        <span className="price-custom">Price on Request</span>
                      )}
                      {ann.minPackets > 1 && (
                        <span className="min-packets-tag">Min {ann.minPackets} {ann.portionUnit || 'units'}</span>
                      )}
                    </div>

                    {ann.discountValue > 0 && (
                      <div className="announcement-card__discount-pill">
                        🎉 Web Offer: {ann.discountType === 'percentage' ? `${ann.discountValue}% OFF` : `₹${ann.discountValue} FLAT OFF`}
                      </div>
                    )}

                    <div className="announcement-fulfillment-tag">
                      {ann.deliveryOption === 'Self Service' ? (
                        <span className="fulfillment-pill fulfillment-pill--self">
                          🛍️ Self Service (Kitchen Pickup Only)
                        </span>
                      ) : ann.deliveryOption === 'Delivery' ? (
                        <span className="fulfillment-pill fulfillment-pill--del">
                          🚚 Doorstep Delivery Only
                        </span>
                      ) : (
                        <span className="fulfillment-pill fulfillment-pill--both">
                          🚚 Doorstep Delivery &amp; 🛍️ Kitchen Pickup
                        </span>
                      )}
                    </div>

                    <div className="announcement-card__actions">
                      <button
                        type="button"
                        className="btn btn--primary btn--order-announcement"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAnnouncement(ann, true);
                        }}
                      >
                        Pre-Order Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="no-announcements-card">
            <div className="empty-icon">🍳</div>
            <h3>Upcoming Cooking Days Will Be Announced Here</h3>
            <p>
              We regularly schedule signature Dum Biryani and feast days. Stay tuned or place a
              custom catering inquiry below for your date!
            </p>
            <a href="#quotation" className="btn btn--outline">
              Request Custom Catering Quotation &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
