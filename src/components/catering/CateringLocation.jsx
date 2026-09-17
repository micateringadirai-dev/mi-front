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
              <span className="location-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Central Kitchen &amp; Counter
              </span>
              <h3>M I CATERING SERVICE</h3>
              <p className="location-tagline">Adirampattinam • Authentic Flavors for Every Celebration</p>
            </div>

            <div className="location-address-box">
              <div className="address-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <div className="address-text">
                <strong>Kitchen &amp; Pickup Address</strong>
                <p>KALLUKOLLAI, Adirampattinam, Tamil Nadu 614701</p>
              </div>
            </div>

            <div className="location-meta-grid">
              <div className="meta-item">
                <span className="meta-label">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                  Direct Phone
                </span>
                <a href="tel:+919842096814" className="meta-val">
                  +91 98420 96814
                </a>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  FSSAI Lic. No.
                </span>
                <span className="meta-val">22426460000049</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
                    <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
                  </svg>
                  Fulfillment
                </span>
                <span className="meta-val">Doorstep Delivery &amp; Self Pickup</span>
              </div>
            </div>

            <div className="location-actions">
              <a
                href={CATERING_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary btn--directions"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
                </svg>
                <span>Get Directions on Google Maps</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
              <a href="tel:+919842096814" className="btn btn--outline btn--call-kitchen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>Call Kitchen</span>
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
