import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import './Navbar.scss';

const links = [
  { to: '/', label: 'Home' },
  { to: '/catering', label: 'MI Catering' },
  { to: '/masala-mill', label: 'Ibrahim Masala Mill' },
  { to: '/cold-press-oil', label: 'Aafiya Cold Pressed Oils' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Lock scroll when mobile menu is open & listen for Escape key
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setOpen(false);
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__brand" onClick={() => setOpen(false)}>
            MI <span>Groups</span>
          </NavLink>

          <nav className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
            <div className="navbar__drawer-header">
              <span className="navbar__drawer-title">MI <span>Groups</span></span>
            </div>

            <div className="navbar__drawer-links">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
            </div>

            <div className="navbar__drawer-footer">
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => {
                  setOpen(false);
                  openCart();
                }}
              >
                🛒 View Cart ({totalCount})
              </button>
              <a
                href={location.pathname.startsWith('/catering') ? 'tel:+919842096814' : 'tel:+919629533887'}
                className="btn btn--outline btn--sm"
              >
                📞 Call Us
              </a>
            </div>
          </nav>

          <div className="navbar__actions">
            <button
              type="button"
              className="navbar__cart-btn"
              onClick={openCart}
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <span className="nav-cart-icon">🛒</span>
              {totalCount > 0 && <span className="nav-cart-badge">{totalCount}</span>}
            </button>

            <button
              className={`navbar__toggle ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu drawer */}
      <div
        className={`navbar__overlay ${open ? 'navbar__overlay--visible' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
    </>
  );
}

