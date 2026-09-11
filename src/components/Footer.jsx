import { Link } from 'react-router-dom';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand-col">
          <h3>
            MI <span>Groups</span>
          </h3>
          <p>
            A family of trusted businesses — MI Catering Services, Ibrahim Masala Mill, and
            Aafiya Cold Pressed Oils — serving quality, purity, and tradition since generations.
          </p>
          <div className="footer__crest">
            <span className="crest-tag">Family Run • FSSAI Certified • Est. Generations</span>
          </div>
        </div>

        <div>
          <h4>Our Businesses</h4>
          <ul className="footer__links">
            <li><Link to="/catering">MI Catering Services</Link></li>
            <li><Link to="/masala-mill">Ibrahim Masala Mill</Link></li>
            <li><Link to="/cold-press-oil">Aafiya Cold Pressed Oils</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact &amp; Visit Us</h4>
          <div className="footer-contacts">
            <div className="footer-contact-item">
              <span className="biz-name">MI Catering</span>
              <a href="tel:+919842096814" className="contact-link">
                <span className="contact-icon">📞</span> +91 98420 96814
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="biz-name">Ibrahim Masala Mill</span>
              <a href="tel:+919629533887" className="contact-link">
                <span className="contact-icon">📞</span> +91 96295 33887
              </a>
            </div>
            <div className="footer-contact-item">
              <span className="biz-name">Aafiya Cold Pressed Oil</span>
              <a href="tel:+919629533887" className="contact-link">
                <span className="contact-icon">📞</span> +91 96295 33887
              </a>
            </div>
            <p className="footer-address">
              <span className="contact-icon">📍</span> Adirampattinam, Tamil Nadu
            </p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} MI Groups (migroups.in). All rights reserved.</p>
          <p className="footer__tagline">Crafted with care, purity and family trust.</p>
        </div>
      </div>
    </footer>
  );
}
