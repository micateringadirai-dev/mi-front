import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

const GRINDING_TYPES = [
  'Fine Powder Grinding',
  'Coarse Crushing',
  'Traditional Stone Ground',
  'Pounding & Fine Milling',
  'Smooth Flour Milling',
  'Custom Texture as per Request',
];

const CATEGORIES = ['Spices', 'Blends', 'Grains & Flours', 'Other'];

export default function GrindingServicesPanel() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

  const initialForm = {
    name: '',
    category: 'Spices',
    grindingType: 'Fine Powder Grinding',
    pricePerKg: '',
    minQuantityKg: '1',
    notes: '',
    image: '',
    isActive: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/masala/admin/grinding-services');
      setServices(res.data?.data || []);
    } catch {
      toast.error('Failed to load grinding service rate card');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      category: item.category || 'Spices',
      grindingType: item.grindingType || 'Fine Powder Grinding',
      pricePerKg: item.pricePerKg ?? '',
      minQuantityKg: item.minQuantityKg ?? '1',
      notes: item.notes || '',
      image: item.image || '',
      isActive: item.isActive !== false,
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
    data.append('folder', 'migroups/grinding');

    setUploading(true);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url;
      setForm((prev) => ({
        ...prev,
        image: uploadedUrl,
      }));
      toast.success('Spice photo uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error('Spice / Item name is required');
    }
    if (form.pricePerKg === '' || isNaN(parseFloat(form.pricePerKg))) {
      return toast.error('Please enter a valid price per kg');
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        grindingType: form.grindingType,
        pricePerKg: parseFloat(form.pricePerKg) || 0,
        minQuantityKg: parseFloat(form.minQuantityKg) || 1,
        notes: form.notes.trim(),
        image: form.image,
        isActive: form.isActive,
      };

      if (editingId) {
        const res = await api.put(`/masala/admin/grinding-services/${editingId}`, payload);
        setServices((prev) => prev.map((s) => (s._id === editingId ? res.data.data : s)));
        toast.success('Grinding service rate updated');
      } else {
        const res = await api.post('/masala/admin/grinding-services', payload);
        setServices((prev) => [...prev, res.data.data]);
        toast.success('Grinding service added to rate card');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grinding service');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      const updated = !item.isActive;
      await api.put(`/masala/admin/grinding-services/${item._id}`, { isActive: updated });
      setServices((prev) =>
        prev.map((s) => (s._id === item._id ? { ...s, isActive: updated } : s))
      );
      toast.success(`${item.name} is now ${updated ? 'Active' : 'Hidden from public'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from grinding rates?`)) return;

    try {
      await api.delete(`/masala/admin/grinding-services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success('Grinding service removed');
    } catch {
      toast.error('Failed to delete grinding service');
    }
  };

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.grindingType && s.grindingType.toLowerCase().includes(search.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="table-panel">
      {/* HEADER EXPLANATION BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(180, 83, 9, 0.14) 100%)',
          border: '1px solid rgba(217, 119, 6, 0.25)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: '2rem' }}>⚙️</div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h4 style={{ margin: 0, color: '#92400e', fontWeight: 700 }}>
            Customer Spice Grinding &amp; Crushing Rate Card
          </h4>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: '#78350f', lineHeight: 1.4 }}>
            Manage the list of spices customers can bring to our mill shop, their milling style (fine powder, coarse crushing, stone pounding), and the grinding rate per kg (₹/kg).
          </p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={openAddModal}>
          ➕ Add Grinding Spice
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="filters-bar">
        <div className="filter-group filter-group--search" style={{ flex: 2 }}>
          <label>Search Spice Rates</label>
          <input
            placeholder="Search by spice name (e.g. Chilli, மல்லி), milling type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ flex: 1 }}>
          <label>Category Filter</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories ({services.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={openAddModal}>
            ➕ Add Spice
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{filtered.length}</strong> grinding spice rate{filtered.length === 1 ? '' : 's'}
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
          <p>Loading grinding rate card...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="admin-mobile-cards">
          {filtered.map((s) => (
            <div className="mobile-product-card" key={s._id}>
              <div className="mobile-product-card__header">
                <div className="product-thumb mobile-thumb">
                  {s.image ? (
                    <img src={s.image} alt={s.name} />
                  ) : (
                    <span className="thumb-placeholder">⚙️</span>
                  )}
                </div>
                <div className="mobile-product-info">
                  <strong className="item-title">{s.name}</strong>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    <span className="category-pill" style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px' }}>
                      {s.grindingType}
                    </span>
                    <span className="category-pill" style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '6px' }}>
                      {s.category || 'Spices'}
                    </span>
                  </div>
                  {s.notes && <p className="item-sub" style={{ marginTop: '0.35rem' }}>{s.notes}</p>}
                </div>
                <button
                  type="button"
                  className={`status-badge-btn ${s.isActive ? 'status-active' : 'status-inactive'}`}
                  onClick={() => toggleStatus(s)}
                  title="Click to toggle visibility on website"
                >
                  {s.isActive ? '● Active' : '○ Inactive'}
                </button>
              </div>

              <div className="mobile-product-card__metrics">
                <div className="metric-cell">
                  <span className="cell-label">Grinding Fee (Per KG)</span>
                  <strong className="cell-val" style={{ color: '#b45309' }}>
                    ₹{s.pricePerKg} <small>/kg</small>
                  </strong>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Min Weight</span>
                  <span className="packet-count">{s.minQuantityKg || 1} kg min</span>
                </div>
              </div>

              <div className="mobile-product-card__actions">
                <button
                  type="button"
                  className="btn-action btn-action--edit"
                  onClick={() => openEditModal(s)}
                  title="Edit spice grinding rate"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn-action btn-action--delete"
                  onClick={() => handleDelete(s._id, s.name)}
                  title="Remove from rate card"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <span>⚙️</span>
              <p>No grinding spices found matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table masala-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Spice / Item Name</th>
                  <th>Milling / Texture Type</th>
                  <th>Category</th>
                  <th>Grinding Fee (₹/kg)</th>
                  <th>Min Qty</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id}>
                    <td style={{ width: '70px' }}>
                      <div className="product-thumb">
                        {s.image ? (
                          <img src={s.image} alt={s.name} />
                        ) : (
                          <span className="thumb-placeholder">⚙️</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="item-title">{s.name}</strong>
                      {s.notes && <span className="item-sub">{s.notes}</span>}
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          display: 'inline-block',
                        }}
                      >
                        {s.grindingType}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          background: '#e0e7ff',
                          color: '#3730a3',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        {s.category || 'Spices'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: '#b45309' }}>₹{s.pricePerKg}</strong> /kg
                    </td>
                    <td>
                      <span className="packet-count">{s.minQuantityKg || 1} kg</span>
                    </td>
                    <td>
                      <button
                        className={`status-badge-btn ${s.isActive ? 'status-active' : 'status-inactive'}`}
                        onClick={() => toggleStatus(s)}
                        title="Click to toggle visibility on website"
                      >
                        {s.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-action--edit"
                          onClick={() => openEditModal(s)}
                          title="Edit spice grinding rate"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-action--delete"
                          onClick={() => handleDelete(s._id, s.name)}
                          title="Delete spice grinding rate"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="empty-cell">
                      <div className="empty-state">
                        <span>⚙️</span>
                        <p>No grinding service found. Click &quot;Add Grinding Spice&quot; to add one!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FOR ADD / EDIT GRINDING SERVICE */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} data-lenis-prevent="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Grinding Spice Rate' : 'Add Spice for Customer Grinding'}</h3>
              <button className="modal-close" onClick={closeModal} type="button">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body" data-lenis-prevent="true">
                <div className="form-field">
                  <label>Spice / Item Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dry Red Chilli (சிகப்பு மிளகாய்) or Coriander Seeds"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid--2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Grinding / Milling Type</label>
                    <select
                      value={form.grindingType}
                      onChange={(e) => setForm({ ...form, grindingType: e.target.value })}
                    >
                      {GRINDING_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid--2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-field">
                    <label>Grinding Fee per Kg (₹) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g. 25"
                      value={form.pricePerKg}
                      onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Minimum Quantity (Kg)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="e.g. 1"
                      value={form.minQuantityKg}
                      onChange={(e) => setForm({ ...form, minQuantityKg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Customer Preparation Notes / Instructions</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Must be thoroughly sun-dried without moisture. Stalks removed."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                {/* IMAGE UPLOAD (CLOUDINARY) */}
                <div className="form-field">
                  <label>Spice Photo / Icon (Cloudinary Upload)</label>
                  {form.image ? (
                    <div className="image-preview-box">
                      <img src={form.image} alt="Spice Preview" />
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
                        id="grinding-file-input"
                        accept="image/*"
                        onChange={handleImageFile}
                        disabled={uploading}
                      />
                      <label htmlFor="grinding-file-input" className="upload-dropzone__label">
                        {uploading ? (
                          <div className="upload-spinner">
                            <div className="spinner"></div>
                            <span>Uploading to Cloudinary...</span>
                          </div>
                        ) : (
                          <>
                            <span className="upload-icon">☁️</span>
                            <span className="upload-title">Click to Upload Spice Image</span>
                            <span className="upload-sub">Optional reference photo of the spice</span>
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
                    <span>Active &amp; Displayed on Public Grinding Rate Card</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting || uploading}>
                  {submitting ? 'Saving...' : editingId ? 'Update Rate' : 'Add to Rate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
