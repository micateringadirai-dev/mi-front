import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function OilProductsPanel() {
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
    packageSizes: [
      { size: '500ml', price: '', stock: '' },
      { size: '1L', price: '', stock: '' },
    ],
    images: [],
    isActive: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/oil/admin/products');
      setProducts(res.data.data || []);
    } catch {
      toast.error('Failed to load oil products');
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
      packageSizes:
        Array.isArray(p.packageSizes) && p.packageSizes.length > 0
          ? p.packageSizes.map((s) => ({
              size: s.size || '',
              price: s.price ?? '',
              stock: s.stock ?? '',
            }))
          : [
              { size: '500ml', price: '', stock: '' },
              { size: '1L', price: '', stock: '' },
            ],
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

  const handlePackageSizeChange = (index, field, value) => {
    setForm((prev) => {
      const updatedSizes = [...prev.packageSizes];
      updatedSizes[index] = { ...updatedSizes[index], [field]: value };
      return { ...prev, packageSizes: updatedSizes };
    });
  };

  const addPackageSize = (presetSize = '') => {
    setForm((prev) => ({
      ...prev,
      packageSizes: [
        ...prev.packageSizes,
        { size: presetSize || '', price: '', stock: '' },
      ],
    }));
  };

  const removePackageSize = (index) => {
    if (form.packageSizes.length <= 1) {
      toast.error('At least one package size is required');
      return;
    }
    setForm((prev) => ({
      ...prev,
      packageSizes: prev.packageSizes.filter((_, i) => i !== index),
    }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'migroups/oil');

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

    const cleanSizes = form.packageSizes
      .filter((s) => s.size && s.size.trim())
      .map((s) => ({
        size: s.size.trim(),
        price: parseFloat(s.price) || 0,
        stock: parseInt(s.stock, 10) || 0,
      }));

    if (cleanSizes.length === 0) {
      return toast.error('Please add at least one package size with size and price');
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        packageSizes: cleanSizes,
        images: form.images,
        isActive: form.isActive,
      };

      if (editingId) {
        const res = await api.put(`/oil/admin/products/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? res.data.data : p)));
        toast.success('Oil product updated');
      } else {
        const res = await api.post('/oil/admin/products', payload);
        setProducts((prev) => [res.data.data, ...prev]);
        toast.success('Oil product created');
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
      await api.put(`/oil/admin/products/${p._id}`, { isActive: updated });
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
      await api.delete(`/oil/admin/products/${id}`);
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
          <label>Search Oil Products</label>
          <input
            placeholder="Search by oil name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={openAddModal}>
            ➕ Add Oil Product
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{filtered.length}</strong> oil product{filtered.length === 1 ? '' : 's'}
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
          <p>Loading oil products...</p>
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
                    <span className="thumb-placeholder">🫒</span>
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

              <div className="mobile-product-card__oil-sizes">
                <span className="cell-label">Package Sizes &amp; Stock:</span>
                <div className="pkg-pill-list">
                  {Array.isArray(p.packageSizes) && p.packageSizes.length > 0 ? (
                    p.packageSizes.map((s, idx) => (
                      <span className="pkg-pill" key={idx}>
                        <strong>{s.size}:</strong> ₹{s.price} ({s.stock || 0} in stock)
                      </span>
                    ))
                  ) : (
                    <span className="pkg-pill pkg-pill--empty">No sizes set</span>
                  )}
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
              <span>🫒</span>
              <p>No oil products found matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table oil-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Product Name</th>
                  <th>Package Sizes &amp; Prices</th>
                  <th>Stock Levels</th>
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
                          <span className="thumb-placeholder">🫒</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong className="item-title">{p.name}</strong>
                      {p.description && <span className="item-sub">{p.description}</span>}
                    </td>
                    <td>
                      <div className="pkg-pill-list">
                        {Array.isArray(p.packageSizes) && p.packageSizes.length > 0 ? (
                          p.packageSizes.map((s, idx) => (
                            <span className="pkg-pill" key={idx}>
                              <strong>{s.size}:</strong> ₹{s.price}
                            </span>
                          ))
                        ) : (
                          <span className="pkg-pill pkg-pill--empty">No sizes set</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="stock-info-list">
                        {Array.isArray(p.packageSizes) && p.packageSizes.length > 0 ? (
                          p.packageSizes.map((s, idx) => (
                            <span className="stock-info-item" key={idx}>
                              {s.size}: <strong>{s.stock || 0}</strong> pcs
                            </span>
                          ))
                        ) : (
                          <span>0</span>
                        )}
                      </div>
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
                        <span>🫒</span>
                        <p>No cold pressed oil products found. Click &quot;Add Oil Product&quot; to upload one!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FOR ADD / EDIT OIL PRODUCT */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} data-lenis-prevent="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Oil Product' : 'Add New Oil Product'}</h3>
              <button className="modal-close" onClick={closeModal} type="button">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body" data-lenis-prevent="true">
                <div className="form-field">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sesame Oil (Nallennai), Coconut Oil, Groundnut Oil"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <div className="quick-suggestions">
                    <span className="quick-suggestions-label">Suggestions:</span>
                    {[
                      'Sesame Oil (Nallennai)',
                      'Coconut Oil',
                      'Groundnut Oil',
                      'Castor Oil',
                      'Mustard Oil',
                      'Deepam Oil',
                    ].map((oilName) => (
                      <button
                        key={oilName}
                        type="button"
                        className={`quick-tag ${form.name === oilName ? 'active' : ''}`}
                        onClick={() => setForm((prev) => ({ ...prev, name: oilName }))}
                      >
                        {oilName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    placeholder="Briefly describe the extraction method (e.g. traditional wood chekku), seeds sourcing, purity..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                {/* PACKAGE SIZES & PRICING */}
                <div className="form-field">
                  <div className="field-header-row">
                    <label>Package Sizes &amp; Pricing *</label>
                    <div className="preset-sizes">
                      <span className="preset-label">Quick Add:</span>
                      {['250ml', '500ml', '1L', '2L', '5L'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          className="btn-preset-size"
                          onClick={() => {
                            if (!form.packageSizes.some((s) => s.size.toLowerCase() === sz.toLowerCase())) {
                              addPackageSize(sz);
                            } else {
                              toast('Size already added', { icon: 'ℹ️' });
                            }
                          }}
                        >
                          +{sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="package-sizes-list">
                    {form.packageSizes.map((pkg, idx) => (
                      <div className="package-size-row" key={idx}>
                        <div className="pkg-input-group pkg-size">
                          <label>Size / Bottle</label>
                          <input
                            type="text"
                            placeholder="e.g. 500ml, 1L"
                            value={pkg.size}
                            onChange={(e) => handlePackageSizeChange(idx, 'size', e.target.value)}
                            required
                          />
                        </div>
                        <div className="pkg-input-group pkg-price">
                          <label>Price (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 250"
                            value={pkg.price}
                            onChange={(e) => handlePackageSizeChange(idx, 'price', e.target.value)}
                            required
                          />
                        </div>
                        <div className="pkg-input-group pkg-stock">
                          <label>Stock (Qty)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 50"
                            value={pkg.stock}
                            onChange={(e) => handlePackageSizeChange(idx, 'stock', e.target.value)}
                          />
                        </div>
                        <div className="pkg-action">
                          <button
                            type="button"
                            className="btn-remove-pkg"
                            onClick={() => removePackageSize(idx)}
                            title="Remove this size"
                            disabled={form.packageSizes.length <= 1}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn btn--outline btn--sm btn-add-custom-size"
                    onClick={() => addPackageSize('')}
                  >
                    ➕ Add Custom Size / Quantity
                  </button>
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
                        id="oil-file-input"
                        accept="image/*"
                        onChange={handleImageFile}
                        disabled={uploading}
                      />
                      <label htmlFor="oil-file-input" className="upload-dropzone__label">
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
