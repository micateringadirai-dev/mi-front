import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function MasalaProductsPanel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

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

      {/* VIEW TOGGLE & COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{filtered.length}</strong> masala product{filtered.length === 1 ? '' : 's'}
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
          <p>Loading masala products...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="admin-mobile-cards">
          {filtered.map((p) => (
            <div className="mobile-product-card" key={p._id}>
              <div className="mobile-product-card__header">
                <div className="product-thumb mobile-thumb">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} />
                  ) : (
                    <span className="thumb-placeholder">🌶️</span>
                  )}
                </div>
                <div className="mobile-product-info">
                  <strong className="item-title">{p.name}</strong>
                  {p.description && <p className="item-sub">{p.description}</p>}
                </div>
                <button
                  type="button"
                  className={`status-badge-btn ${p.isActive ? 'status-active' : 'status-inactive'}`}
                  onClick={() => toggleStatus(p)}
                  title="Click to toggle active status"
                >
                  {p.isActive ? '● Active' : '○ Inactive'}
                </button>
              </div>

              <div className="mobile-product-card__metrics">
                <div className="metric-cell">
                  <span className="cell-label">Price per KG</span>
                  <strong className="cell-val">
                    ₹{p.pricePerKg} <small>/kg</small>
                  </strong>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Stock Available</span>
                  <span className="packet-count">{p.availableQuantityKg} kg</span>
                </div>
              </div>

              <div className="mobile-product-card__actions">
                <button
                  type="button"
                  className="btn-action btn-action--edit"
                  onClick={() => openEditModal(p)}
                  title="Edit product"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn-action btn-action--delete"
                  onClick={() => handleDelete(p._id, p.name)}
                  title="Delete product"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <span>🌶️</span>
              <p>No masala products found matching your search.</p>
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
