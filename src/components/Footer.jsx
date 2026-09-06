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
            A family of trusted businesses — MI Catering Services, Ibrahim Masala Mill, and Afia
            Cold Press Oil — serving quality and tradition since generations.
          </p>
        </div>

        <div>
          <h4>Our Businesses</h4>
          <ul>
            <li><Link to="/catering">MI Catering Services</Link></li>
            <li><Link to="/masala-mill">Ibrahim Masala Mill</Link></li>
            <li><Link to="/cold-press-oil">Afia Cold Press Oil</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <p>📞 +91 90000 00000</p>
          <p>✉️ info@migroups.in</p>
          <p>📍 Coimbatore, Tamil Nadu</p>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} MI Groups (migroups.in). All rights reserved.</p>
      </div>
    </footer>
  );
}
