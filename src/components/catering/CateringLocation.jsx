import RevealText from '../RevealText.jsx';

export const CATERING_MAP_URL =
  'https://www.google.com/maps/dir//M+I+CATERING+SERVICE+-+ADIRAMPATTINAM,+KALLUKOLLAI,+Adirampattinam,+Tamil+Nadu+614701/@10.3417539,79.3690824,3427m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x3b0003e6ec626489:0xd2bfb2e7528a21a3!2m2!1d79.3752531!2d10.3475511?entry=ttu&g_ep=EgoyMDI2MDkwOS4wIKXMDSoASAFQAw%3D%3D';

export default function CateringLocation() {
  return (
    <section id="location" className="section catering-location-section">
      <div className="container">
        <div className="section-heading text-center">
          <span className="eyebrow">Visit Our Kitchen</span>
          <RevealText as="h2">Our Central Kitchen Location</RevealText>
          <p>
            Experience where traditional firewood feasts and festive culinary creations come to life.
            Self-service / pickup orders can be collected directly from our central kitchen counter.
          </p>
        </div>

        <div className="catering-location-card">
          <div className="location-info-pane">
            <div className="location-header">
              <span className="location-badge">📍 Central Kitchen &amp; Counter</span>
              <h3>M I CATERING SERVICE</h3>
              <p className="location-tagline">Adirampattinam • Authentic Flavors for Every Celebration</p>
            </div>

            <div className="location-address-box">
              <div className="address-icon">🏢</div>
              <div className="address-text">
                <strong>Kitchen &amp; Pickup Address</strong>
                <p>KALLUKOLLAI, Adirampattinam, Tamil Nadu 614701</p>
              </div>
            </div>

            <div className="location-meta-grid">
              <div className="meta-item">
                <span className="meta-label">📞 Direct Phone</span>
                <a href="tel:+919842096814" className="meta-val">
                  +91 98420 96814
                </a>
              </div>
              <div className="meta-item">
                <span className="meta-label">🌿 FSSAI Lic. No.</span>
                <span className="meta-val">22426460000049</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">🛍️ Fulfillment</span>
                <span className="meta-val">Doorstep Delivery &amp; Self Pickup</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">🕒 Operating Hours</span>
                <span className="meta-val">6:00 AM – 10:00 PM Daily</span>
              </div>
            </div>

            <div className="location-actions">
              <a
                href={CATERING_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--directions"
              >
                🗺️ Get Directions on Google Maps ↗
              </a>
              <a href="tel:+919842096814" className="btn btn--outline">
                📞 Call Kitchen
              </a>
            </div>
          </div>

          <div className="location-map-pane">
            <iframe
              title="M I Catering Service Location Map"
              src="https://maps.google.com/maps?q=10.3475511,79.3752531&hl=en&z=16&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '360px', width: '100%', height: '100%', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
