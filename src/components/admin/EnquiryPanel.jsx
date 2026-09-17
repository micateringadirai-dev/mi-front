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

  const escapeCsvVal = (val) => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/"/g, '""');
    if (s.search(/("|,|\n|\r)/g) >= 0) {
      return `"${s}"`;
    }
    return s;
  };

  const generateClientEnquiriesCsv = (items, resName) => {
    const isMasala = resName === 'masala';
    const headers = isMasala
      ? ['Product', 'Quantity (kg)', 'Customer', 'Phone', 'Address', 'Message', 'Status', 'Submitted At']
      : ['Product', 'Size', 'Quantity', 'Customer', 'Phone', 'Address', 'Additional Requirements', 'Status', 'Submitted At'];

    const dataRows = (items || []).map((e) => {
      if (isMasala) {
        return [
          e.productName || '—',
          e.quantityKg || '—',
          e.customerName || '—',
          e.phoneNumber || '—',
          e.address || '—',
          e.message || '—',
          e.status || 'Pending',
          e.createdAt ? new Date(e.createdAt).toLocaleString() : '—',
        ];
      } else {
        return [
          e.productName || '—',
          e.size || '—',
          e.quantity || '—',
          e.customerName || '—',
          e.phoneNumber || '—',
          e.address || '—',
          e.additionalRequirements || '—',
          e.status || 'Pending',
          e.createdAt ? new Date(e.createdAt).toLocaleString() : '—',
        ];
      }
    });

    const csvContent =
      '\uFEFF' + [headers, ...dataRows].map((row) => row.map(escapeCsvVal).join(',')).join('\r\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  };

  const exportFile = async (format = 'xlsx') => {
    let effectiveExt = format === 'csv' ? 'csv' : 'xlsx';
    let mime =
      format === 'csv'
        ? 'text/csv;charset=utf-8;'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let blob;

    try {
      const res = await api.get(`/${resource}/admin/enquiries/export/excel`, {
        params: { format },
        responseType: 'blob',
      });
      blob = res.data;

      // Double check: if blob contains HTML, reject it
      if (blob instanceof Blob) {
        const textPreview = await blob.slice(0, 100).text();
        if (
          textPreview.toLowerCase().includes('<!doctype') ||
          textPreview.toLowerCase().includes('<html')
        ) {
          throw new Error('API returned HTML page instead of spreadsheet data.');
        }
      }
    } catch (backendErr) {
      console.warn('Backend export unavailable or returned HTML; generating clean CSV on device:', backendErr);
      blob = generateClientEnquiriesCsv(rows, resource);
      effectiveExt = 'csv';
      mime = 'text/csv;charset=utf-8;';
    }

    try {
      const filename = `${resource}-enquiries.${effectiveExt}`;
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
      toast.success(`Downloaded ${effectiveExt.toUpperCase()} successfully!`);
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
