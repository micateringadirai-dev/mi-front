import miCateringLogo from '../../assets/mi-catering-logo.png';

export default function CateringHero({ cookingAnnouncements, onSelectAnnouncement }) {
  return (
    <section className="business-hero">
      <div className="container">
        {/* FSSAI license badge */}
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
        <p>
          Weddings, housewarmings, corporate banquets &amp; scheduled signature feast pre-orders —
          cooked with wood-fire care.
        </p>
        <div className="business-hero__ctas">
          {cookingAnnouncements.length > 0 && (
            <button
              type="button"
              className="btn btn--primary btn--hero-preorder"
              onClick={() => onSelectAnnouncement(cookingAnnouncements[0], true)}
            >
              🔥 Pre-Order Daily Special ({cookingAnnouncements.length})
            </button>
          )}
          <a href="#quotation" className="btn btn--primary">
            📋 Request Quotation
          </a>
          <a href="tel:+919842096814" className="btn btn--outline">
            📞 +91 98420 96814
          </a>
        </div>
      </div>

      <div className="business-hero__curve" aria-hidden="true">
        <svg viewBox="0 0 1440 50" fill="none" preserveAspectRatio="none">
          <path
            d="M0,0 C360,50 1080,50 1440,0 L1440,50 L0,50 Z"
            fill="#fdfbf7"
          />
        </svg>
      </div>
    </section>
  );
}
