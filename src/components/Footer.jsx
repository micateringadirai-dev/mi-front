import { Link } from 'react-router-dom';
import './Footer.scss';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <h3>
            MI <span>Groups</span>
          </h3>
          <p>
            A family of trusted businesses — MI Catering Services, Ibrahim Masala Mill, and
            Aafiya Cold Pressed Oils — serving quality and tradition since generations.
          </p>
        </div>

        <div>
          <h4>Our Businesses</h4>
          <ul>
            <li><Link to="/catering">MI Catering Services</Link></li>
            <li><Link to="/masala-mill">Ibrahim Masala Mill</Link></li>
            <li><Link to="/cold-press-oil">Aafiya Cold Pressed Oils</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact Us</h4>
          <div className="footer-contacts">
            <div className="footer-contact-item">
              <span className="biz-name">MI Catering</span>
              <a href="tel:+919842096814">📞 +91 98420 96814</a>
            </div>
            <div className="footer-contact-item">
              <span className="biz-name">Ibrahim Masala Mill</span>
              <a href="tel:+919629533887">📞 +91 96295 33887</a>
            </div>
            <div className="footer-contact-item">
              <span className="biz-name">Aafiya Cold Pressed Oil</span>
              <a href="tel:+919629533887">📞 +91 96295 33887</a>
            </div>
            <p className="footer-address">📍 Adirampattinam, Tamil Nadu</p>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} MI Groups (migroups.in). All rights reserved.</p>
      </div>
    </footer>
  );
}
