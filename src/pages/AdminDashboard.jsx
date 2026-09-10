import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import './AdminDashboard.scss';

const TABS = [
  { id: 'Overview', label: 'Overview', icon: '📊' },
  { id: 'Catering Orders', label: 'Catering Orders', icon: '🍽️' },
  { id: 'Masala Products', label: 'Masala Products', icon: '🧂' },
  { id: 'Masala Enquiries', label: 'Masala Enquiries', icon: '🌶️' },
  { id: 'Oil Enquiries', label: 'Oil Enquiries', icon: '🫒' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/admin/summary').then((res) => setSummary(res.data.data)).catch(() => {});
  }, [tab]);

  return (
    <div className="admin-dashboard">
      <aside className="admin-dashboard__sidebar">
        <div className="admin-dashboard__brand">
          <div className="brand-badge">MI</div>
          <div className="brand-text">
            <h3>MI Groups</h3>
            <span className="brand-sub">Management Suite</span>
          </div>
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
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-btn__icon">{t.icon}</span>
              <span className="nav-btn__label">{t.label}</span>
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
          <button className="logout-btn" onClick={logout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-dashboard__content">
        <header className="admin-dashboard__topbar">
          <div>
            <div className="topbar-eyebrow">MI Groups • Operations Control</div>
            <h2>{tab}</h2>
          </div>
          <div className="topbar-actions">
            <span className="live-status">
              <span className="live-dot"></span> System Online
            </span>
          </div>
        </header>

        <div className="admin-dashboard__body">
          {tab === 'Overview' && <Overview summary={summary} onSelectTab={setTab} />}
          {tab === 'Catering Orders' && <CateringOrders />}
          {tab === 'Masala Products' && <MasalaProductsPanel />}
          {tab === 'Masala Enquiries' && <EnquiryPanel resource="masala" itemLabel="Product" />}
          {tab === 'Oil Enquiries' && <EnquiryPanel resource="oil" itemLabel="Product" />}
        </div>
      </main>
    </div>
  );
}

function Overview({ summary, onSelectTab }) {
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
            Pending to Confirmed or Completed, and export clean Excel reports anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

function CateringOrders() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ date: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
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

  const exportExcel = () => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.status) params.set('status', filters.status);
    const token = localStorage.getItem('mi_admin_token');
    fetch(`/api/catering/admin/orders/export/excel?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catering-orders-${filters.date || 'all'}.xlsx`;
        a.click();
      })
      .catch(() => toast.error('Export failed'));
  };

  return (
    <div className="table-panel">
      <div className="filters-bar">
        <div className="filter-group">
          <label>Event Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />
        </div>
        <div className="filter-group">
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
        <div className="filter-group filter-group--search">
          <label>Search</label>
          <input
            placeholder="Search name, phone, or event..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={fetchOrders}>
            Filter
          </button>
          <button className="btn btn--outline btn--sm" onClick={exportExcel}>
            ⬇ Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading catering bookings...</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Item / Event</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Packets</th>
                  <th>Event Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <strong className="item-title">{o.itemName}</strong>
                      {o.foodRequirements && (
                        <span className="item-sub">{o.foodRequirements}</span>
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
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
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
    </div>
  );
}

function EnquiryPanel({ resource, itemLabel }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const exportExcel = () => {
    const token = localStorage.getItem('mi_admin_token');
    fetch(`/api/${resource}/admin/enquiries/export/excel`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource}-enquiries.xlsx`;
        a.click();
      })
      .catch(() => toast.error('Export failed'));
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
          <button className="btn btn--outline btn--sm" onClick={exportExcel}>
            ⬇ Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading {title.toLowerCase()}...</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
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

function MasalaProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    description: '',
    pricePerKg: '',
    availableQuantityKg: '',
    images: [],
    isActive: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/masala/admin/products');
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load masala products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      pricePerKg: p.pricePerKg ?? '',
      availableQuantityKg: p.availableQuantityKg ?? '',
      images: p.images || [],
      isActive: p.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'migroups/masala');

    setUploading(true);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data.data.url;
      setForm((prev) => ({
        ...prev,
        images: [uploadedUrl],
      }));
      toast.success('Product image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, images: [] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error('Product name is required');
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        pricePerKg: parseFloat(form.pricePerKg) || 0,
        availableQuantityKg: parseFloat(form.availableQuantityKg) || 0,
        images: form.images,
        isActive: form.isActive,
      };

      if (editingId) {
        const res = await api.put(`/masala/admin/products/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data.data : p)));
        toast.success('Masala product updated');
      } else {
        const res = await api.post('/masala/admin/products', payload);
        setProducts((prev) => [res.data.data, ...prev]);
        toast.success('Masala product created');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (p) => {
    try {
      const updated = !p.isActive;
      await api.put(`/masala/admin/products/${p._id}`, { isActive: updated });
      setProducts((prev) =>
        prev.map((item) => (item._id === p._id ? { ...item, isActive: updated } : item))
      );
      toast.success(`${p.name} is now ${updated ? 'Active' : 'Inactive'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await api.delete(`/masala/admin/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="table-panel">
      <div className="filters-bar">
        <div className="filter-group filter-group--search">
          <label>Search Products</label>
          <input
            placeholder="Search by masala name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={openAddModal}>
            ➕ Add Masala Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading masala products...</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Product Name</th>
                  <th>Price (₹/kg)</th>
                  <th>Stock (kg)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td style={{ width: '80px' }}>
                      <div className="product-thumb">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} />
                        ) : (
                          <span className="thumb-placeholder">🌶️</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="item-title">{p.name}</strong>
                      {p.description && <span className="item-sub">{p.description}</span>}
                    </td>
                    <td>
                      <strong>₹{p.pricePerKg}</strong> /kg
                    </td>
                    <td>
                      <span className="packet-count">{p.availableQuantityKg} kg</span>
                    </td>
                    <td>
                      <button
                        className={`status-badge-btn ${p.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => toggleStatus(p)}
                        title="Click to toggle active status"
                      >
                        {p.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-action--edit"
                          onClick={() => openEditModal(p)}
                          title="Edit product"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-action--delete"
                          onClick={() => handleDelete(p._id, p.name)}
                          title="Delete product"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      <div className="empty-state">
                        <span>🌶️</span>
                        <p>No masala products found. Click &quot;Add Masala Product&quot; to upload one!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FOR ADD / EDIT MASALA PRODUCT */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} data-lenis-prevent="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Masala Product' : 'Add New Masala Product'}</h3>
              <button className="modal-close" onClick={closeModal} type="button">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body" data-lenis-prevent="true">
                <div className="form-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Kashmiri Chilli Powder"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe flavor profile, sourcing, or milling..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="grid grid--2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label>Price per Kg (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 450"
                      value={form.pricePerKg}
                      onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Available Stock (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 50"
                      value={form.availableQuantityKg}
                      onChange={(e) => setForm({ ...form, availableQuantityKg: e.target.value })}
                    />
                  </div>
                </div>

                {/* IMAGE UPLOAD SECTION (CLOUDINARY) */}
                <div className="form-field">
                  <label>Product Photo (Cloudinary Upload)</label>
                  
                  {form.images?.[0] ? (
                    <div className="image-preview-box">
                      <img src={form.images[0]} alt="Uploaded Preview" />
                      <div className="image-preview-overlay">
                        <span className="image-url-tag">Hosted on Cloudinary</span>
                        <button type="button" className="btn-remove-img" onClick={removeImage}>
                          ✕ Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-dropzone">
                      <input
                        type="file"
                        id="masala-file-input"
                        accept="image/*"
                        onChange={handleImageFile}
                        disabled={uploading}
                      />
                      <label htmlFor="masala-file-input" className="upload-dropzone__label">
                        {uploading ? (
                          <div className="upload-spinner">
                            <div className="spinner"></div>
                            <span>Uploading to Cloudinary...</span>
                          </div>
                        ) : (
                          <>
                            <span className="upload-icon">☁️</span>
                            <span className="upload-title">Click to Upload Image</span>
                            <span className="upload-sub">Auto-optimizes &amp; uploads to Cloudinary</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active &amp; Visible on Public Website</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting || uploading}>
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
