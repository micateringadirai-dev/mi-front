export default function AdminSidebar({
  tabs,
  currentTab,
  onSelectTab,
  summary,
  mobileNavOpen,
  onCloseMobileNav,
  user,
  onLogout,
}) {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onCloseMobileNav}
        />
      )}

      <aside className={`admin-dashboard__sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
        <div className="admin-dashboard__brand">
          <div className="brand-badge">MI</div>
          <div className="brand-text">
            <h3>MI Groups</h3>
            <span className="brand-sub">Management Suite</span>
          </div>
          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={onCloseMobileNav}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <div className="admin-dashboard__user-pill">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.role || 'superadmin'}</span>
          </div>
        </div>

        <nav className="admin-dashboard__nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-btn ${currentTab === t.id ? 'active' : ''}`}
              onClick={() => {
                onSelectTab(t.id);
                onCloseMobileNav();
              }}
            >
              <span className="nav-btn__icon">{t.icon}</span>
              <span className="nav-btn__label">{t.label}</span>
              {t.id === 'Cooking Announcements' && summary?.activeCookingEvents > 0 && (
                <span className="nav-btn__count">{summary.activeCookingEvents}</span>
              )}
              {t.id === 'Catering Orders' && summary?.pendingCatering > 0 && (
                <span className="nav-btn__count">{summary.pendingCatering}</span>
              )}
              {t.id === 'Masala Enquiries' && summary?.newMasala > 0 && (
                <span className="nav-btn__count">{summary.newMasala}</span>
              )}
              {t.id === 'Oil Enquiries' && summary?.newOil > 0 && (
                <span className="nav-btn__count">{summary.newOil}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-dashboard__footer">
          <a href="/" target="_blank" rel="noreferrer" className="site-link">
            <span>🌐</span> Public Website
          </a>
          <button className="logout-btn" onClick={onLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
