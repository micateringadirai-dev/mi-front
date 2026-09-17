import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function EnquiryPanel({ resource, itemLabel }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

  const fetchRows = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await api.get(`/${resource}/admin/enquiries`, { params });
      setRows(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/${resource}/admin/enquiries/${id}/status`, { status: newStatus });
      setRows((prev) => prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r)));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const exportFile = async (format = 'xlsx') => {
    const token = localStorage.getItem('mi_admin_token');
    const isCsv = format === 'csv';
    try {
      const res = await fetch(`/api/${resource}/admin/enquiries/export/excel?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const ext = isCsv ? 'csv' : 'xlsx';
      const mime = isCsv
        ? 'text/csv;charset=utf-8;'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const filename = `${resource}-enquiries.${ext}`;

      const fileBlob = new Blob([blob], { type: mime });
      const url = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 1000);
      toast.success(`Downloaded ${ext.toUpperCase()} successfully!`);
    } catch {
      toast.error('Export failed');
    }
  };

  const title = resource === 'masala' ? 'Masala Mill Enquiries' : 'Cold Press Oil Enquiries';

  return (
    <div className="table-panel">
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['New', 'Contacted', 'Confirmed', 'Closed'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="filter-group filter-group--search">
          <label>Search</label>
          <input
            placeholder="Search customer, phone, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={fetchRows}>
            Filter
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => exportFile('xlsx')}
            title="Download Excel spreadsheet"
          >
            ⬇ Export Excel
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => exportFile('csv')}
            title="Download CSV for Mobile without Excel app"
          >
            📱 Mobile CSV
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{rows.length}</strong> {title.toLowerCase()}
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
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="admin-mobile-cards">
          {rows.map((r) => (
            <div className="mobile-enquiry-card" key={r._id}>
              <div className="mobile-enquiry-card__header">
                <div>
                  <strong className="item-title">{r.productName}</strong>
                  {r.quantityKg && <span className="item-sub">{r.quantityKg} kg</span>}
                  {r.size && (
                    <span className="item-sub">
                      Size: {r.size} ({r.quantity} qty)
                    </span>
                  )}
                </div>
                <select
                  className={`status-badge-select status-${r.status.toLowerCase()}`}
                  value={r.status}
                  onChange={(e) => updateStatus(r._id, e.target.value)}
                >
                  {['New', 'Contacted', 'Confirmed', 'Closed'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="mobile-enquiry-card__grid">
                <div className="metric-cell">
                  <span className="cell-label">Customer</span>
                  <strong className="cell-val">{r.customerName}</strong>
                  {r.address && <small className="address-sub">{r.address}</small>}
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Phone</span>
                  <a href={`tel:${r.phoneNumber}`} className="phone-btn">
                    📞 {r.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div className="empty-state">
              <span>📭</span>
              <p>No enquiries found matching your filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table enquiries-table">
              <thead>
                <tr>
                  <th>{itemLabel}</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong className="item-title">{r.productName}</strong>
                      {r.quantityKg && <span className="item-sub">{r.quantityKg} kg</span>}
                      {r.size && <span className="item-sub">Size: {r.size} ({r.quantity} qty)</span>}
                    </td>
                    <td>
                      <div>{r.customerName}</div>
                      {r.address && <small className="address-sub">{r.address}</small>}
                    </td>
                    <td>
                      <a href={`tel:${r.phoneNumber}`} className="phone-link">
                        {r.phoneNumber}
                      </a>
                    </td>
                    <td>
                      <select
                        className={`status-badge-select status-${r.status.toLowerCase()}`}
                        value={r.status}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                      >
                        {['New', 'Contacted', 'Confirmed', 'Closed'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-cell">
                      <div className="empty-state">
                        <span>📭</span>
                        <p>No enquiries found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
