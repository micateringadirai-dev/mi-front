export default function CookingTicker({ cookingAnnouncements, onSelectAnnouncement }) {
  if (!cookingAnnouncements || cookingAnnouncements.length === 0) return null;

  const firstAnn = cookingAnnouncements[0];

  return (
    <div className="cooking-ticker">
      <div className="container cooking-ticker__inner">
        <span className="ticker-badge">📢 Special Cooking Day Announced</span>
        <span className="ticker-text">
          {firstAnn.title} on{' '}
          <strong>
            {new Date(firstAnn.eventDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </strong>
          {firstAnn.pricePerPacket > 0
            ? ` — ₹${firstAnn.pricePerPacket} / ${firstAnn.portionUnit || 'packet'}`
            : ''}{' '}
          {firstAnn.discountValue > 0 && (
            <span className="ticker-discount">
              • Web Offer: {firstAnn.discountType === 'percentage' ? `${firstAnn.discountValue}% Off` : `₹${firstAnn.discountValue} Off`}
            </span>
          )}
          {' '}• Pre-orders open now!
        </span>
        <button
          type="button"
          className="ticker-link"
          onClick={() => onSelectAnnouncement(firstAnn, true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Pre-Order Now &rarr;
        </button>
      </div>
    </div>
  );
}
