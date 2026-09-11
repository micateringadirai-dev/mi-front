export default function AdminTopbar({ tab, mobileNavOpen, onToggleMobileNav }) {
  return (
    <header className="admin-dashboard__topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-nav-toggle-btn"
          onClick={onToggleMobileNav}
          aria-label="Toggle Navigation"
        >
          <span className="toggle-icon">{mobileNavOpen ? '✕' : '☰'}</span>
          <span className="toggle-label">Menu</span>
        </button>
        <div>
          <div className="topbar-eyebrow">MI Groups • Operations Control</div>
          <h2>{tab}</h2>
        </div>
      </div>
      <div className="topbar-actions">
        <span className="live-status">
          <span className="live-dot"></span> System Online
        </span>
      </div>
    </header>
  );
}
