import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function CateringOrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', search: '', deliveryType: '', orderType: '' });
  const [loading, setLoading] = useState(true);
  const [printSlipOrder, setPrintSlipOrder] = useState(null);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.deliveryType) params.deliveryType = filters.deliveryType;
      if (filters.orderType) params.orderType = filters.orderType;
      const res = await api.get('/catering/admin/orders', { params });
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/catering/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteOrder = async (id, customerName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete order request for "${customerName || 'Customer'}"?`
      )
    ) {
      return;
    }
    try {
      await api.delete(`/catering/admin/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.success('Order request deleted successfully');
    } catch {
      toast.error('Failed to delete order request');
    }
  };

  const handlePrintSlip = () => {
    const slip = document.getElementById('printable-order-slip');
    if (!slip) {
      window.print();
      return;
    }

    try {
      let printFrame = document.getElementById('print-receipt-hidden-iframe');
      if (printFrame) {
        document.body.removeChild(printFrame);
      }
      printFrame = document.createElement('iframe');
      printFrame.id = 'print-receipt-hidden-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>MI Catering - Slip #${printSlipOrder?._id ? printSlipOrder._id.slice(-6).toUpperCase() : 'RECEIPT'}</title>
  <style>
    @page {
      size: auto;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #111827;
      font-size: 0.88rem;
      line-height: 1.4;
      padding: 10px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .printable-slip {
      max-width: 440px;
      margin: 0 auto;
      background: #ffffff;
      color: #111827;
    }
    .slip-header {
      text-align: center;
      margin-bottom: 0.85rem;
    }
    .slip-header h2 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #831843;
      margin: 0 0 0.15rem;
      letter-spacing: 0.5px;
    }
    .slip-sub {
      font-size: 0.82rem;
      font-weight: 600;
      color: #4b5563;
      margin: 0 0 0.15rem;
    }
    .slip-meta, .slip-fssai {
      font-size: 0.74rem;
      color: #6b7280;
      margin: 0;
    }
    .slip-fssai {
      font-weight: 600;
      margin-top: 0.15rem;
    }
    .slip-badge-line {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .slip-type-badge, .slip-mode-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    .slip-type-badge {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }
    .slip-mode-badge {
      background: #e0e7ff;
      color: #3730a3;
      border: 1px solid #c7d2fe;
    }
    .slip-divider {
      height: 1px;
      border-top: 1px dashed #9ca3af;
      margin: 0.65rem 0;
    }
    .slip-section {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .slip-row {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.84rem;
    }
    .slip-label {
      color: #4b5563;
      font-weight: 600;
      font-size: 0.78rem;
    }
    .slip-val {
      color: #111827;
      text-align: right;
      word-break: break-word;
    }
    .slip-row--highlight {
      background: #fef2f2;
      padding: 0.35rem 0.5rem;
      border-radius: 4px;
      margin-top: 0.2rem;
    }
    .slip-row--highlight .slip-label,
    .slip-row--highlight .slip-val {
      color: #991b1b;
      font-weight: 800;
    }
    .slip-items-table {
      margin: 0.5rem 0;
    }
    .slip-items-header {
      display: grid;
      grid-template-columns: 2fr 45px 55px 65px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #4b5563;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid #e5e7eb;
      gap: 0.25rem;
    }
    .col-qty, .col-rate, .col-total {
      text-align: right;
    }
    .slip-item-row {
      display: grid;
      grid-template-columns: 2fr 45px 55px 65px;
      font-size: 0.82rem;
      padding: 0.35rem 0;
      border-bottom: 1px dotted #f3f4f6;
      align-items: center;
      gap: 0.25rem;
    }
    .slip-item-row--main {
      font-weight: 700;
      color: #111827;
    }
    .slip-item-unit {
      display: block;
      font-weight: normal;
      font-size: 0.72rem;
      color: #6b7280;
    }
    .slip-item-row--extra {
      color: #374151;
      font-size: 0.78rem;
    }
    .slip-totals {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-top: 0.5rem;
    }
    .slip-total-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.84rem;
      color: #374151;
    }
    .slip-total-row--discount {
      color: #dc2626;
      font-weight: 600;
    }
    .slip-total-row--final {
      font-size: 1.05rem;
      font-weight: 800;
      color: #111827;
      padding-top: 0.4rem;
      border-top: 2px solid #111827;
      margin-top: 0.25rem;
    }
    .slip-notes {
      font-size: 0.78rem;
      color: #4b5563;
      background: #f9fafb;
      padding: 0.5rem;
      border-radius: 6px;
      margin-top: 0.5rem;
    }
    .slip-notes p {
      margin: 0.15rem 0;
    }
    .slip-footer {
      text-align: center;
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px dashed #d1d5db;
    }
    .slip-footer p {
      margin: 0.15rem 0;
      font-size: 0.75rem;
      color: #6b7280;
    }
    .slip-tagline {
      font-weight: 600;
      color: #92400e;
    }
  </style>
</head>
<body>
  <div class="printable-slip">
    ${slip.innerHTML}
  </div>
</body>
</html>`);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch {
          window.print();
        }
      }, 250);
    } catch {
      window.print();
    }
  };

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);
    if (filters.deliveryType) params.set('deliveryType', filters.deliveryType);
    if (filters.orderType) params.set('orderType', filters.orderType);
    if (filters.search) params.set('search', filters.search);
    const token = localStorage.getItem('mi_admin_token');
    fetch(`/api/catering/admin/orders/export/excel?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catering-orders-${filters.deliveryType ? filters.deliveryType.toLowerCase().replace(/\s+/g, '-') + '-' : ''}${filters.date || 'all'}.xlsx`;
        a.click();
      })
      .catch(() => toast.error('Export failed'));
  };

  const exportKitchenPrepSheet = () => {
    const params = new URLSearchParams();
    params.set('mode', 'prep');
    if (filters.date) params.set('date', filters.date);
    if (filters.deliveryType) params.set('deliveryType', filters.deliveryType);
    if (filters.status) params.set('status', filters.status);
    if (filters.orderType) params.set('orderType', filters.orderType);
    if (filters.search) params.set('search', filters.search);
    const token = localStorage.getItem('mi_admin_token');
    fetch(`/api/catering/admin/orders/export/excel?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kitchen-prep-review-${filters.date || 'all'}.xlsx`;
        a.click();
        toast.success('Kitchen Preparation Review Sheet downloaded!');
      })
      .catch(() => toast.error('Preparation sheet export failed'));
  };

  const deliveryOrdersCount = orders.filter((o) => (o.deliveryType || 'Delivery') === 'Delivery').length;
  const selfServiceOrdersCount = orders.filter((o) => o.deliveryType === 'Self Service').length;
  const totalPacketsCount = orders.reduce((sum, o) => sum + (Number(o.numberOfPackets) || 0), 0);

  return (
    <div className="table-panel">
      {/* QUICK SUMMARY METRICS BAR */}
      <div className="catering-summary-strip">
        <button
          type="button"
          className={`summary-pill ${!filters.deliveryType ? 'is-active' : ''}`}
          onClick={() => {
            setFilters((prev) => ({ ...prev, deliveryType: '' }));
          }}
          title="Click to view all orders"
        >
          <span className="pill-icon">📦</span>
          <div className="pill-content">
            <span className="pill-title">All Orders</span>
            <strong className="pill-num">{orders.length}</strong>
          </div>
        </button>

        <button
          type="button"
          className={`summary-pill summary-pill--delivery ${filters.deliveryType === 'Delivery' ? 'is-active' : ''}`}
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              deliveryType: prev.deliveryType === 'Delivery' ? '' : 'Delivery',
            }));
          }}
          title="Click to filter by Doorstep Delivery"
        >
          <span className="pill-icon">🚚</span>
          <div className="pill-content">
            <span className="pill-title">Doorstep Delivery</span>
            <strong className="pill-num">{deliveryOrdersCount}</strong>
          </div>
        </button>

        <button
          type="button"
          className={`summary-pill summary-pill--self ${filters.deliveryType === 'Self Service' ? 'is-active' : ''}`}
          onClick={() => {
            setFilters((prev) => ({
              ...prev,
              deliveryType: prev.deliveryType === 'Self Service' ? '' : 'Self Service',
            }));
          }}
          title="Click to filter by Self Service / Kitchen Pickup"
        >
          <span className="pill-icon">🛍️</span>
          <div className="pill-content">
            <span className="pill-title">Self Service (Pickup)</span>
            <strong className="pill-num">{selfServiceOrdersCount}</strong>
          </div>
        </button>

        <div className="summary-pill summary-pill--packets">
          <span className="pill-icon">🍱</span>
          <div className="pill-content">
            <span className="pill-title">Total Food Packets</span>
            <strong className="pill-num">{totalPacketsCount}</strong>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group filter-group--date">
          <label>Event Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>
        <div className="filter-group">
          <label>Order Type</label>
          <select
            value={filters.orderType}
            onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="pre-order">🔥 Pre-Orders Only</option>
            <option value="quotation">📋 Quotations Only</option>
          </select>
        </div>
        <div className="filter-group filter-group--status">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-group filter-group--fulfillment">
          <label>Fulfillment Mode</label>
          <select
            value={filters.deliveryType}
            onChange={(e) => setFilters({ ...filters, deliveryType: e.target.value })}
          >
            <option value="">All Fulfillment</option>
            <option value="Delivery">🚚 Doorstep Delivery</option>
            <option value="Self Service">🛍️ Self Service (Pickup)</option>
          </select>
        </div>
        <div className="filter-group filter-group--search">
          <label>Search</label>
          <input
            placeholder="Search customer, phone, event, address..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={fetchOrders}>
            Filter
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm btn--reset-filters"
            onClick={() => {
              setFilters({ orderType: '', status: '', deliveryType: '', search: '', date: '' });
            }}
            title="Unselect and reset all filters"
          >
            ↺ Reset
          </button>
          <button className="btn btn--outline btn--sm" onClick={exportExcel} title="Export current filtered orders">
            ⬇ Export Excel
          </button>
          <button
            className="btn btn--outline btn--sm btn--prep-export"
            onClick={exportKitchenPrepSheet}
            title="Export full kitchen preparation review & dispatch sheet for selected date"
            style={{ borderColor: '#2d6a4f', color: '#1b4332', fontWeight: '600' }}
          >
            📅 Export Prep Sheet (.xlsx)
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & ORDERS COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{orders.length}</strong> {filters.deliveryType ? `${filters.deliveryType} ` : ''}order{orders.length === 1 ? '' : 's'}
        </div>
        <div className="view-mode-pills">
          <button
            type="button"
            className={`view-pill ${viewMode === 'table' ? 'is-active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </button>
          <button
            type="button"
            className={`view-pill ${viewMode === 'cards' ? 'is-active' : ''}`}
            onClick={() => setViewMode('cards')}
          >
            📱 Mobile Cards
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading catering bookings...</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* MOBILE CARDS VIEW (CLEAN TOUCH-FRIENDLY VIEW) */
        <div className="catering-mobile-cards">
          {orders.map((o) => (
            <div className="mobile-order-card" key={o._id}>
              <div className="mobile-order-card__header">
                <div className="order-title-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span className={`order-type-badge ${o.orderType === 'quotation' ? 'order-type-badge--quotation' : 'order-type-badge--preorder'}`}>
                      {o.orderType === 'quotation' ? '📋 Quotation' : '🔥 Pre-Order'}
                    </span>
                    <strong className="order-item-title">{o.itemName}</strong>
                  </div>
                  <span className="order-date-pill">
                    📅 {new Date(o.orderDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn-action btn-action--print"
                    onClick={() => setPrintSlipOrder(o)}
                    title="Print receipt / kitchen slip"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.82rem' }}
                  >
                    🖨️ Slip
                  </button>
                  <select
                    className={`status-badge-select status-${o.status.toLowerCase()}`}
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-action btn-action--delete"
                    onClick={() => deleteOrder(o._id, o.customerName)}
                    title="Delete order request"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.85rem' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="mobile-order-card__fulfillment">
                {o.deliveryType === 'Self Service' ? (
                  <div className="fulfillment-badge-container">
                    <span className="badge-fulfillment badge-fulfillment--self">
                      🛍️ Self Service
                    </span>
                    <span className="fulfillment-sub-text">
                      🏪 MI Catering Central Kitchen (Pickup)
                    </span>
                    {o.address &&
                      !o.address.includes('MI Catering Central Kitchen') &&
                      !o.address.includes('Self Service / Kitchen Pickup') && (
                        <span className="fulfillment-address-text">
                          📝 {o.address}
                        </span>
                      )}
                  </div>
                ) : (
                  <div className="fulfillment-badge-container">
                    <span className="badge-fulfillment badge-fulfillment--del">
                      🚚 Doorstep Delivery
                    </span>
                    {o.address ? (
                      <span className="fulfillment-address-text">
                        📍 {o.address}
                      </span>
                    ) : (
                      <span className="fulfillment-address-text" style={{ color: '#d97706' }}>
                        ⚠️ Address not given
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mobile-order-card__grid">
                <div className="grid-cell">
                  <span className="cell-label">Customer</span>
                  <strong className="cell-val">{o.customerName}</strong>
                </div>
                <div className="grid-cell">
                  <span className="cell-label">Mobile</span>
                  <a href={`tel:${o.mobileNumber}`} className="phone-btn">
                    📞 {o.mobileNumber}
                  </a>
                </div>
                <div className="grid-cell">
                  <span className="cell-label">Quantity</span>
                  <span className="packet-count">
                    {o.numberOfPackets} {o.portionUnit || 'pkts'}
                  </span>
                </div>
                <div className="grid-cell">
                  <span className="cell-label">Payable Total</span>
                  <strong className="total-est-price">
                    ₹{o.finalAmount || o.estimatedAmount || 0}
                  </strong>
                  {o.discountAmount > 0 && (
                    <span className="card-discount-tag">
                      -{o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountAmount}`} off
                    </span>
                  )}
                </div>
              </div>

              {Array.isArray(o.selectedExtras) && o.selectedExtras.length > 0 && (
                <div className="mobile-order-card__extras">
                  <span className="extras-title">🍗 Extra Add-ons:</span>
                  <div className="extras-list">
                    {o.selectedExtras.map((ex, idx) => (
                      <span key={idx} className="extra-item-chip">
                        {ex.name} {ex.portion ? `(${ex.portion})` : ''} × {ex.quantity || 1}{' '}
                        {ex.price ? `(₹${(ex.price || 0) * (ex.quantity || 1)})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(o.foodRequirements || o.additionalNotes) && (
                <div className="mobile-order-card__notes">
                  {o.foodRequirements && (
                    <p className="note-text">
                      <b>Req:</b> {o.foodRequirements}
                    </p>
                  )}
                  {o.additionalNotes && (
                    <p className="note-text">
                      <b>Note:</b> {o.additionalNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="empty-state">
              <span>📭</span>
              <p>No catering orders found matching your filters.</p>
            </div>
          )}
        </div>
      ) : (
        /* DESKTOP / TABLET EXPANDED TABLE VIEW */
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table catering-table">
              <thead>
                <tr>
                  <th>Item &amp; Type</th>
                  <th>Fulfillment &amp; Address</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Quantity / Unit</th>
                  <th>Extra Add-ons</th>
                  <th>Pricing Breakdown</th>
                  <th>Event Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', minWidth: '95px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                        <span className={`order-type-badge ${o.orderType === 'quotation' ? 'order-type-badge--quotation' : 'order-type-badge--preorder'}`}>
                          {o.orderType === 'quotation' ? '📋 Quotation' : '🔥 Pre-Order'}
                        </span>
                      </div>
                      <strong className="item-title">{o.itemName}</strong>
                      {o.portionUnit && <span className="item-sub">({o.portionUnit})</span>}
                      {o.foodRequirements && (
                        <span className="item-sub">{o.foodRequirements}</span>
                      )}
                      {o.additionalNotes && (
                        <span
                          className="item-sub"
                          style={{ fontStyle: 'italic', color: '#886754', marginTop: '0.2rem' }}
                        >
                          Note: {o.additionalNotes}
                        </span>
                      )}
                    </td>
                    <td>
                      {o.deliveryType === 'Self Service' ? (
                        <div className="fulfillment-badge-container">
                          <span className="badge-fulfillment badge-fulfillment--self">
                            🛍️ Self Service
                          </span>
                          <span className="fulfillment-sub-text">
                            🏪 MI Catering Kitchen Pickup
                          </span>
                          {o.address &&
                            !o.address.includes('MI Catering Central Kitchen') &&
                            !o.address.includes('Self Service / Kitchen Pickup') && (
                              <span className="fulfillment-address-text" title={o.address}>
                                📝 {o.address}
                              </span>
                            )}
                        </div>
                      ) : (
                        <div className="fulfillment-badge-container">
                          <span className="badge-fulfillment badge-fulfillment--del">
                            🚚 Doorstep Delivery
                          </span>
                          {o.address ? (
                            <span className="fulfillment-address-text" title={o.address}>
                              📍 {o.address}
                            </span>
                          ) : (
                            <span className="fulfillment-address-text" style={{ color: '#d97706' }}>
                              ⚠️ Address not given
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <a href={`tel:${o.mobileNumber}`} className="phone-link">
                        {o.mobileNumber}
                      </a>
                    </td>
                    <td>
                      <span className="packet-count">{o.numberOfPackets}</span>
                      <small style={{ display: 'block', color: '#6d421d', fontSize: '0.72rem' }}>
                        {o.portionUnit || 'Packets'}
                      </small>
                    </td>
                    <td>
                      {Array.isArray(o.selectedExtras) && o.selectedExtras.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {o.selectedExtras.map((ex, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.78rem',
                                background: '#fef3e7',
                                border: '1px solid #f9d8b8',
                                borderRadius: '4px',
                                padding: '0.15rem 0.45rem',
                                color: '#804419',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              🍗 {ex.name} {ex.portion ? `(${ex.portion})` : ''} × {ex.quantity || 1}{' '}
                              {ex.price ? `(₹${(ex.price || 0) * (ex.quantity || 1)})` : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.82rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <strong style={{ color: '#1b6223', fontSize: '0.95rem' }}>
                          ₹{o.finalAmount || o.estimatedAmount || 0}
                        </strong>
                        {o.discountAmount > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#b22222', background: '#ffe6e6', padding: '0.1rem 0.35rem', borderRadius: '3px', display: 'inline-block' }}>
                            -{o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountAmount}`} off
                          </span>
                        )}
                        {o.subtotalAmount > 0 && o.discountAmount > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#888', textDecoration: 'line-through' }}>
                            ₹{o.subtotalAmount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                    <td>
                      <select
                        className={`status-badge-select status-${o.status.toLowerCase()}`}
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          className="btn-action btn-action--print"
                          onClick={() => setPrintSlipOrder(o)}
                          title="Print receipt / kitchen slip"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.85rem' }}
                        >
                          🖨️
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-action--delete"
                          onClick={() => deleteOrder(o._id, o.customerName)}
                          title="Delete order request"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.85rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="10" className="empty-cell">
                      <div className="empty-state">
                        <span>📭</span>
                        <p>No catering orders found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT-FRIENDLY SLIP MODAL */}
      {printSlipOrder && (
        <div className="modal-backdrop print-slip-modal-backdrop" onClick={() => setPrintSlipOrder(null)}>
          <div className="modal-card print-slip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="print-slip-actions no-print">
              <button
                type="button"
                className="btn btn--primary"
                onClick={handlePrintSlip}
              >
                🖨️ Print Slip Now
              </button>
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setPrintSlipOrder(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* PRINTABLE SLIP CONTENT */}
            <div className="printable-slip" id="printable-order-slip">
              <div className="slip-header">
                <h2>MI CATERING SERVICES</h2>
                <p className="slip-sub">Authentic Flavors For Every Celebration</p>
                <p className="slip-meta">Central Kitchen, Adirampattinam • Phone: +91 98420 96814</p>
                <p className="slip-fssai">FSSAI Certified Commercial Operations</p>
                <div className="slip-divider"></div>
                <div className="slip-badge-line">
                  <span className="slip-type-badge">
                    {printSlipOrder.orderType === 'quotation' ? '📋 EVENT QUOTATION' : '🔥 KITCHEN PRE-ORDER'}
                  </span>
                  <span className="slip-mode-badge">
                    {printSlipOrder.deliveryType === 'Self Service' ? '🛍️ COUNTER PICKUP' : '🚚 DOORSTEP DELIVERY'}
                  </span>
                </div>
              </div>

              <div className="slip-section">
                <div className="slip-row">
                  <span className="slip-label">Order Ref:</span>
                  <span className="slip-val">#{printSlipOrder._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Booking Time:</span>
                  <span className="slip-val">{new Date(printSlipOrder.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div className="slip-row slip-row--highlight">
                  <span className="slip-label">SCHEDULED COOKING DATE:</span>
                  <strong className="slip-val">{new Date(printSlipOrder.orderDate).toDateString()}</strong>
                </div>
              </div>

              <div className="slip-divider"></div>

              <div className="slip-section">
                <div className="slip-row">
                  <span className="slip-label">Customer Name:</span>
                  <strong className="slip-val">{printSlipOrder.customerName}</strong>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Mobile:</span>
                  <strong className="slip-val">{printSlipOrder.mobileNumber}</strong>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Fulfillment:</span>
                  <span className="slip-val">{printSlipOrder.deliveryType || 'Delivery'}</span>
                </div>
                <div className="slip-row">
                  <span className="slip-label">Delivery Address / Pickup Note:</span>
                  <span className="slip-val">{printSlipOrder.address || '-'}</span>
                </div>
              </div>

              <div className="slip-divider"></div>

              <div className="slip-items-table">
                <div className="slip-items-header">
                  <span className="col-desc">Item Description</span>
                  <span className="col-qty">Qty</span>
                  <span className="col-rate">Rate</span>
                  <span className="col-total">Total</span>
                </div>
                <div className="slip-item-row slip-item-row--main">
                  <span className="col-desc">
                    <strong>{printSlipOrder.itemName}</strong>
                    {printSlipOrder.portionUnit && (
                      <small className="slip-item-unit"> ({printSlipOrder.portionUnit})</small>
                    )}
                  </span>
                  <span className="col-qty">{printSlipOrder.numberOfPackets}</span>
                  <span className="col-rate">{printSlipOrder.unitPrice > 0 ? `₹${printSlipOrder.unitPrice}` : '—'}</span>
                  <span className="col-total">
                    {printSlipOrder.unitPrice > 0
                      ? `₹${printSlipOrder.unitPrice * printSlipOrder.numberOfPackets}`
                      : printSlipOrder.subtotalAmount
                      ? `₹${printSlipOrder.subtotalAmount}`
                      : '—'}
                  </span>
                </div>

                {Array.isArray(printSlipOrder.selectedExtras) &&
                  printSlipOrder.selectedExtras.map((ex, idx) => (
                    <div key={idx} className="slip-item-row slip-item-row--extra">
                      <span className="col-desc">
                        + {ex.name} {ex.portion ? `(${ex.portion})` : ''}
                      </span>
                      <span className="col-qty">{ex.quantity || 1}</span>
                      <span className="col-rate">{ex.price ? `₹${ex.price}` : '—'}</span>
                      <span className="col-total">{ex.price ? `₹${ex.price * (ex.quantity || 1)}` : '—'}</span>
                    </div>
                  ))}
              </div>

              <div className="slip-divider"></div>

              <div className="slip-totals">
                {printSlipOrder.subtotalAmount > 0 && (
                  <div className="slip-total-row">
                    <span>Original Subtotal:</span>
                    <span>₹{printSlipOrder.subtotalAmount}</span>
                  </div>
                )}
                {printSlipOrder.discountAmount > 0 && (
                  <div className="slip-total-row slip-total-row--discount">
                    <span>
                      Online Ordering Discount ({printSlipOrder.discountType === 'percentage' ? `${printSlipOrder.discountValue}%` : 'Flat'}):
                    </span>
                    <span>-₹{printSlipOrder.discountAmount}</span>
                  </div>
                )}
                <div className="slip-total-row slip-total-row--final">
                  <strong>FINAL PAYABLE:</strong>
                  <strong>₹{printSlipOrder.finalAmount || printSlipOrder.estimatedAmount || 0}</strong>
                </div>
              </div>

              {(printSlipOrder.foodRequirements || printSlipOrder.additionalNotes) && (
                <>
                  <div className="slip-divider"></div>
                  <div className="slip-notes">
                    {printSlipOrder.foodRequirements && (
                      <p>
                        <b>Food Requirements:</b> {printSlipOrder.foodRequirements}
                      </p>
                    )}
                    {printSlipOrder.additionalNotes && (
                      <p>
                        <b>Special Instructions:</b> {printSlipOrder.additionalNotes}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="slip-footer">
                <p>Thank you for placing your order with MI Catering!</p>
                <p className="slip-tagline">Quality Ingredients • Clean Preparation • Trusted Taste</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
