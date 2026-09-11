import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function CateringGalleryPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const fileInputRef = useRef(null);

  const initialForm = { name: '', imageUrl: '', description: '', order: 0, isActive: true };
  const [form, setForm] = useState(initialForm);

  /* ─── Fetch ─── */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catering/admin/gallery');
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  /* ─── Modal helpers ─── */
  const openAddModal = () => { setEditingId(null); setForm(initialForm); setIsModalOpen(true); };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name || '', imageUrl: item.imageUrl || '', description: item.description || '', order: item.order ?? 0, isActive: item.isActive !== false });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setForm(initialForm); };

  /* ─── Image upload ─── */
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'migroups/catering-gallery');
    setUploading(true);
    try {
      const res = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url;
      if (url) { setForm((p) => ({ ...p, imageUrl: url })); toast.success('Photo uploaded!'); }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Dish name is required');
    if (!form.imageUrl) return toast.error('Please upload a photo first');
    setSubmitting(true);
    try {
      const payload = { name: form.name.trim(), imageUrl: form.imageUrl, description: form.description.trim(), order: parseInt(form.order, 10) || 0, isActive: form.isActive };
      if (editingId) {
        const res = await api.put(`/catering/admin/gallery/${editingId}`, payload);
        setItems((prev) => prev.map((it) => (it._id === editingId ? res.data.data : it)));
        toast.success('Gallery item updated!');
      } else {
        const res = await api.post('/catering/admin/gallery', payload);
        setItems((prev) => [res.data.data, ...prev]);
        toast.success('Food photo added to gallery!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save gallery item');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Toggle active ─── */
  const toggleActive = async (item) => {
    try {
      const updated = !item.isActive;
      await api.put(`/catering/admin/gallery/${item._id}`, { isActive: updated });
      setItems((prev) => prev.map((it) => (it._id === item._id ? { ...it, isActive: updated } : it)));
      toast.success(`"${item.name}" is now ${updated ? 'visible on website' : 'hidden'}`);
    } catch { toast.error('Failed to update status'); }
  };

  /* ─── Delete ─── */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the food gallery?`)) return;
    try {
      await api.delete(`/catering/admin/gallery/${id}`);
      setItems((prev) => prev.filter((it) => it._id !== id));
      toast.success('Gallery item deleted');
    } catch { toast.error('Failed to delete item'); }
  };

  const filtered = items.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.description && it.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="table-panel">
      {/* ── Top bar ── */}
      <div className="filters-bar">
        <div className="filter-group filter-group--search">
          <label>Search Gallery</label>
          <input
            placeholder="Search by dish name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={openAddModal}>
            📷 Add Food Photo
          </button>
        </div>
      </div>

      {/* ── Count bar ── */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{filtered.length}</strong> photo{filtered.length === 1 ? '' : 's'} in gallery
        </div>
        <div style={{ fontSize: '0.8rem', color: '#888' }}>
          ✅ Active photos appear on the public Catering page
        </div>
      </div>

      {/* ── Photo Grid ── */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Loading gallery...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem', padding: '1rem 0' }}>
          {filtered.map((item) => (
            <div
              key={item._id}
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: `2px solid ${item.isActive ? '#e8d5b0' : '#e0e0e0'}`,
                background: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
                opacity: item.isActive ? 1 : 0.55,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'none'; }}
            >
              {/* Image */}
              <div style={{ width: '100%', height: '155px', overflow: 'hidden', background: '#f5f0e8', position: 'relative' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Status pill */}
                <span
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: item.isActive ? 'rgba(27,98,35,0.88)' : 'rgba(90,90,90,0.8)',
                    color: '#fff', fontSize: '0.62rem', fontWeight: 700,
                    padding: '0.18rem 0.5rem', borderRadius: '20px',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  {item.isActive ? '● Live' : '○ Hidden'}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: '0.7rem 0.85rem' }}>
                <strong style={{ fontSize: '0.92rem', color: '#2b1206', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                  🍛 {item.name}
                </strong>
                {item.description && (
                  <p style={{ fontSize: '0.76rem', color: '#9a7455', margin: '0 0 0.45rem', lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                )}
                <div style={{ fontSize: '0.7rem', color: '#bbb', marginBottom: '0.55rem' }}>
                  Order #{item.order} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn-action btn-action--edit"
                    onClick={() => openEditModal(item)}
                    style={{ flex: 1, fontSize: '0.76rem', padding: '0.3rem 0.4rem' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(item)}
                    style={{
                      flex: 1, fontSize: '0.76rem', padding: '0.3rem 0.4rem',
                      borderRadius: '6px', cursor: 'pointer', fontWeight: 600,
                      border: `1px solid ${item.isActive ? '#e0a800' : '#2e7d32'}`,
                      background: 'transparent',
                      color: item.isActive ? '#b08000' : '#2e7d32',
                    }}
                  >
                    {item.isActive ? '🙈 Hide' : '👁 Show'}
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-action--delete"
                    onClick={() => handleDelete(item._id, item.name)}
                    style={{ fontSize: '0.76rem', padding: '0.3rem 0.5rem' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <span>📷</span>
              <p>No food photos yet. Click &quot;Add Food Photo&quot; to upload your first dish!</p>
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} data-lenis-prevent="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">

            {/* Header */}
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Food Photo' : '📷 Add Food Photo'}</h3>
              <button className="modal-close" type="button" onClick={closeModal}>✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body" data-lenis-prevent="true">

                {/* ── Image Upload ── */}
                <div className="form-field">
                  <label>
                    Food Photo <span style={{ color: '#c0392b' }}>*</span>
                  </label>

                  {form.imageUrl ? (
                    <div className="image-preview-box">
                      <img src={form.imageUrl} alt="Preview" style={{ objectFit: 'cover' }} />
                      <div className="image-preview-overlay">
                        <span className="image-url-tag">Photo uploaded</span>
                        <button
                          type="button"
                          className="btn-remove-img"
                          onClick={() => setForm((p) => ({ ...p, imageUrl: '' }))}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-dropzone" htmlFor="gallery-upload-input">
                      <input
                        ref={fileInputRef}
                        id="gallery-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFile}
                      />
                      {uploading ? (
                        <div className="upload-spinner">
                          <div className="spinner"></div>
                          <span>Uploading photo...</span>
                        </div>
                      ) : (
                        <span className="upload-dropzone__label">
                          <span className="upload-icon">📷</span>
                          <span className="upload-title">Click to upload food photo</span>
                          <span className="upload-sub">JPG, PNG, WEBP — max 5 MB recommended</span>
                        </span>
                      )}
                    </label>
                  )}
                </div>

                {/* ── Dish Name ── */}
                <div className="form-field">
                  <label>
                    Dish Name <span style={{ color: '#c0392b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mutton Biryani, Fish Curry, Wedding Meals..."
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                {/* ── Description ── */}
                <div className="form-field">
                  <label>Short Description (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Wood-fire cooked, serves 4–5 persons"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>

                {/* ── Order & Visibility ── */}
                <div className="form-row">
                  <div className="form-field">
                    <label>Display Order</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={form.order}
                      onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                    />
                    <small style={{ color: '#9a7455', fontSize: '0.75rem' }}>Lower number = shows first</small>
                  </div>
                  <div className="form-field">
                    <label>Visibility</label>
                    <div className="admin-toggle-switch-card" style={{ margin: '0.25rem 0 0' }}>
                      <div className="toggle-info">
                        <div className="toggle-title-row">
                          <span className="toggle-icon">👁</span>
                          <strong>Show on website</strong>
                        </div>
                        <span className="toggle-hint">Visible on public Catering page</span>
                      </div>
                      <label className="switch-control">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

              </div>{/* end modal-body */}

              {/* ── Footer ── */}
              <div className="modal-actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={closeModal} disabled={submitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={submitting || uploading || !form.imageUrl}
                >
                  {submitting
                    ? (editingId ? 'Saving...' : 'Adding...')
                    : (editingId ? '💾 Save Changes' : '📷 Add to Gallery')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
