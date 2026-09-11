export default function OverviewPanel({ summary, onSelectTab }) {
  if (!summary) {
    return (
      <div className="overview-loading">
        <div className="spinner"></div>
        <p>Loading overview metrics...</p>
      </div>
    );
  }

  return (
    <div className="overview-container">
      <div className="grid grid--3 overview-cards">
        <div className="card stat-card" onClick={() => onSelectTab('Catering Orders')}>
          <div className="stat-card__header">
            <div className="stat-card__icon catering-badge">🍽️</div>
            <span className="stat-card__tag">MI Catering</span>
          </div>
          <div className="stat-card__value">{summary.pendingCatering}</div>
          <div className="stat-card__label">Pending Catering Orders</div>
          <div className="stat-card__footer">
            <span>Review customer event bookings</span>
            <span className="arrow">&rarr;</span>
          </div>
        </div>

        <div className="card stat-card" onClick={() => onSelectTab('Masala Enquiries')}>
          <div className="stat-card__header">
            <div className="stat-card__icon masala-badge">🌶️</div>
            <span className="stat-card__tag">Masala Mill</span>
          </div>
          <div className="stat-card__value">{summary.newMasala}</div>
          <div className="stat-card__label">New Spice Inquiries</div>
          <div className="stat-card__footer">
            <span>View quantity &amp; customer requests</span>
            <span className="arrow">&rarr;</span>
          </div>
        </div>

        <div className="card stat-card" onClick={() => onSelectTab('Oil Enquiries')}>
          <div className="stat-card__header">
            <div className="stat-card__icon oil-badge">🫒</div>
            <span className="stat-card__tag">Cold Press Oil</span>
          </div>
          <div className="stat-card__value">{summary.newOil}</div>
          <div className="stat-card__label">New Oil Inquiries</div>
          <div className="stat-card__footer">
            <span>View size &amp; customer requests</span>
            <span className="arrow">&rarr;</span>
          </div>
        </div>
      </div>

      <div className="quick-info-card">
        <div className="info-icon">💡</div>
        <div className="info-body">
          <h4>Administrator Quick Actions</h4>
          <p>
            Use the tabs on the left to filter enquiries by date or status, update progression from
            Pending to Confirmed or Completed, and manage Masala &amp; Cold Pressed Oil products anytime.
          </p>
          <div style={{ marginTop: '0.85rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onSelectTab('Cooking Announcements')}
            >
              📢 Cooking Announcements
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onSelectTab('Masala Products')}
            >
              🧂 Manage Masala Products
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => onSelectTab('Oil Products')}
            >
              🫒 Manage Oil Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
