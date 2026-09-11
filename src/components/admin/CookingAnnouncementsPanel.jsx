import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';

export default function CookingAnnouncementsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 768 ? 'cards' : 'table'
  );

  // Helper inputs for adding extra side dishes inside modal
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraPortion, setNewExtraPortion] = useState('');
  const [newExtraPrice, setNewExtraPrice] = useState('');

  const initialForm = {
    title: '',
    eventDate: '',
    category: 'special-event',
    deliveryOption: 'Both', // 'Both', 'Delivery', 'Self Service'
    portionUnit: 'Packet', // e.g. "Packet", "1 Kg Bucket (4-5 Persons)", "2 Kg Family Pack"
    pricePerPacket: '',
    minPackets: 1,
    maxPackets: 0,
    menuItems: '',
    extraSideDishes: [], // [{ name, portion, price }]
    discountType: 'none', // 'none', 'percentage', 'flat'
    discountValue: '',
    isPreOrderActive: true,
    description: '',
    images: [],
    isActive: true,
  };
  const [form, setForm] = useState(initialForm);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/catering/admin/events');
      setEvents(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      toast.error('Failed to load cooking announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setNewExtraName('');
    setNewExtraPortion('');
    setNewExtraPrice('');
    setIsModalOpen(true);
  };

  const openEditModal = (ev) => {
    setEditingId(ev._id);
    const dateStr = ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '';
    setForm({
      title: ev.title || '',
      eventDate: dateStr,
      category: ev.category || 'special-event',
      deliveryOption: ev.deliveryOption || 'Both',
      portionUnit: ev.portionUnit || 'Packet',
      pricePerPacket: ev.pricePerPacket ?? '',
      minPackets: ev.minPackets ?? 1,
      maxPackets: ev.maxPackets ?? 0,
      menuItems: Array.isArray(ev.menuItems) ? ev.menuItems.join(', ') : '',
      extraSideDishes: Array.isArray(ev.extraSideDishes) ? ev.extraSideDishes : [],
      discountType: ev.discountType || 'none',
      discountValue: ev.discountValue ?? '',
      isPreOrderActive: ev.isPreOrderActive !== false,
      description: ev.description || '',
      images: ev.images || [],
      isActive: ev.isActive !== false,
    });
    setNewExtraName('');
    setNewExtraPortion('');
    setNewExtraPrice('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
    setNewExtraName('');
    setNewExtraPortion('');
    setNewExtraPrice('');
  };

  const addExtraDish = () => {
    if (!newExtraName.trim()) {
      return toast.error('Please enter extra side dish name');
    }
    const newDish = {
      name: newExtraName.trim(),
      portion: newExtraPortion.trim(),
      price: parseFloat(newExtraPrice) || 0,
    };
    setForm((prev) => ({
      ...prev,
      extraSideDishes: [...(prev.extraSideDishes || []), newDish],
    }));
    setNewExtraName('');
    setNewExtraPortion('');
    setNewExtraPrice('');
  };

  const removeExtraDish = (index) => {
    setForm((prev) => ({
      ...prev,
      extraSideDishes: (prev.extraSideDishes || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    data.append('folder', 'migroups/catering');

    setUploading(true);
    try {
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.data?.url;
      if (uploadedUrl) {
        setForm((prev) => ({
          ...prev,
          images: [uploadedUrl],
        }));
        toast.success('Banner image uploaded!');
      }
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
    if (!form.title.trim()) {
      return toast.error('Announcement Title is required');
    }
    if (!form.eventDate) {
      return toast.error('Cooking Date is required');
    }

    setSubmitting(true);
    try {
      const menuItemsArr = form.menuItems
        ? form.menuItems
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: form.title.trim(),
        eventDate: form.eventDate,
        category: form.category,
        deliveryOption: form.deliveryOption || 'Both',
        portionUnit: form.portionUnit || 'Packet',
        pricePerPacket: parseFloat(form.pricePerPacket) || 0,
        minPackets: parseInt(form.minPackets, 10) || 1,
        maxPackets: parseInt(form.maxPackets, 10) || 0,
        menuItems: menuItemsArr,
        extraSideDishes: form.extraSideDishes || [],
        discountType: form.discountType || 'none',
        discountValue: parseFloat(form.discountValue) || 0,
        isPreOrderActive: form.isPreOrderActive !== false,
        description: form.description.trim(),
        images: form.images,
        isActive: form.isActive,
      };

      if (editingId) {
        const res = await api.put(`/catering/admin/events/${editingId}`, payload);
        setEvents((prev) => prev.map((ev) => (ev._id === editingId ? res.data.data : ev)));
        toast.success('Cooking announcement updated!');
      } else {
        const res = await api.post('/catering/admin/events', payload);
        setEvents((prev) => [res.data.data, ...prev]);
        toast.success('New cooking day announced successfully!');
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save cooking announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (ev) => {
    try {
      const updated = !ev.isActive;
      await api.put(`/catering/admin/events/${ev._id}`, { isActive: updated });
      setEvents((prev) =>
        prev.map((item) => (item._id === ev._id ? { ...item, isActive: updated } : item))
      );
      toast.success(
        `"${ev.title}" is now ${updated ? 'Active (Pre-Orders Open)' : 'Inactive (Closed)'}`
      );
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/catering/admin/events/${id}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
      toast.success('Announcement deleted');
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const filtered = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      (ev.description && ev.description.toLowerCase().includes(search.toLowerCase())) ||
      (ev.category && ev.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="table-panel">
      <div className="filters-bar">
        <div className="filter-group filter-group--search">
          <label>Search Announcements</label>
          <input
            placeholder="Search by dish name, date or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="btn btn--primary btn--sm" onClick={openAddModal}>
            📢 Announce New Cooking Day
          </button>
        </div>
      </div>

      {/* VIEW TOGGLE & COUNT BAR */}
      <div className="table-controls-bar">
        <div className="orders-count-text">
          Showing <strong>{filtered.length}</strong> announcement{filtered.length === 1 ? '' : 's'}
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
          <p>Loading cooking announcements...</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="admin-mobile-cards">
          {filtered.map((ev) => (
            <div className="mobile-announcement-card" key={ev._id}>
              <div className="mobile-announcement-card__top">
                <div className="event-date-cell">
                  <strong>
                    📅 {new Date(ev.eventDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
                <button
                  type="button"
                  className={`status-badge-btn ${ev.isActive ? 'status-active' : 'status-inactive'}`}
                  onClick={() => toggleStatus(ev)}
                >
                  {ev.isActive ? '● Active' : '○ Inactive'}
                </button>
              </div>

              <div className="mobile-announcement-card__title-block">
                <strong className="item-title">{ev.title}</strong>
                {ev.description && <p className="item-sub">{ev.description}</p>}
                {Array.isArray(ev.menuItems) && ev.menuItems.length > 0 && (
                  <div
                    className="admin-menu-tags"
                    style={{
                      marginTop: '0.35rem',
                      display: 'flex',
                      gap: '0.3rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {ev.menuItems.map((m, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          background: '#f5eee3',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: '#593e2b',
                        }}
                      >
                        ✦ {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mobile-announcement-card__grid">
                <div className="metric-cell">
                  <span className="cell-label">Rate / Packet</span>
                  <strong className="cell-val">
                    {ev.pricePerPacket > 0 ? `₹${ev.pricePerPacket}` : 'On Request'}
                  </strong>
                </div>
                <div className="metric-cell">
                  <span className="cell-label">Fulfillment</span>
                  <span
                    className="badge-fulfillment badge-fulfillment--self"
                    style={{ fontSize: '0.72rem' }}
                  >
                    {ev.deliveryOption === 'Delivery'
                      ? '🚚 Delivery Only'
                      : ev.deliveryOption === 'Self Service'
                      ? '🛍️ Pickup Only'
                      : '🚚 & 🛍️ Both'}
                  </span>
                </div>
              </div>

              {Array.isArray(ev.extraSideDishes) && ev.extraSideDishes.length > 0 && (
                <div className="mobile-announcement-card__extras">
                  <span className="cell-label">Extra Side Dishes:</span>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.3rem',
                      flexWrap: 'wrap',
                      marginTop: '0.2rem',
                    }}
                  >
                    {ev.extraSideDishes.map((ex, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.74rem',
                          background: '#fef3e7',
                          border: '1px solid #f6d8b3',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: '#844d21',
                        }}
                      >
                        🍗 {ex.name} (+₹{ex.price})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mobile-announcement-card__actions">
                <button
                  type="button"
                  className="btn-action btn-action--edit"
                  onClick={() => openEditModal(ev)}
                  title="Edit announcement"
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  className="btn-action btn-action--delete"
                  onClick={() => handleDelete(ev._id, ev.title)}
                  title="Delete announcement"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <span>📢</span>
              <p>No cooking announcements found matching your search.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="admin-table announcements-table">
              <thead>
                <tr>
                  <th>Cooking Date</th>
                  <th>Feast / Dish Title</th>
                  <th>Category</th>
                  <th>Price / Packet</th>
                  <th>Extra Side Dishes</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => (
                  <tr key={ev._id}>
                    <td>
                      <div className="event-date-cell">
                        <strong>
                          {new Date(ev.eventDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                      </div>
                    </td>
                    <td>
                      <strong className="item-title">{ev.title}</strong>
                      {ev.description && <span className="item-sub">{ev.description}</span>}
                      {Array.isArray(ev.menuItems) && ev.menuItems.length > 0 && (
                        <div
                          className="admin-menu-tags"
                          style={{
                            marginTop: '0.35rem',
                            display: 'flex',
                            gap: '0.3rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          {ev.menuItems.map((m, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                background: '#f5eee3',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                color: '#593e2b',
                              }}
                            >
                              ✦ {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge-tag">
                        {ev.category ? ev.category.replace('-', ' ') : 'special-event'}
                      </span>
                    </td>
                    <td>
                      {ev.pricePerPacket > 0 ? (
                        <strong>₹{ev.pricePerPacket}</strong>
                      ) : (
                        <span style={{ color: '#888' }}>On Request</span>
                      )}
                    </td>
                    <td>
                      {Array.isArray(ev.extraSideDishes) && ev.extraSideDishes.length > 0 ? (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {ev.extraSideDishes.map((ex, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.72rem',
                                background: '#fef3e7',
                                border: '1px solid #f6d8b3',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                color: '#844d21',
                              }}
                            >
                              🍗 {ex.name} (+₹{ex.price})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: '#999', fontSize: '0.82rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`status-badge-btn ${
                          ev.isActive ? 'status-active' : 'status-inactive'
                        }`}
                        onClick={() => toggleStatus(ev)}
                        title="Click to toggle active status"
                      >
                        {ev.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-action--edit"
                          onClick={() => openEditModal(ev)}
                          title="Edit announcement"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-action--delete"
                          onClick={() => handleDelete(ev._id, ev.title)}
                          title="Delete announcement"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      <div className="empty-state">
                        <span>📢</span>
                        <p>
                          No cooking announcements found. Click &quot;Announce New Cooking Day&quot;
                          to post one!
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FOR ADD / EDIT COOKING ANNOUNCEMENT */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal} data-lenis-prevent="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} data-lenis-prevent="true">
            <div className="modal-header">
              <h3>{editingId ? 'Edit Cooking Announcement' : '📢 Announce New Cooking Day'}</h3>
              <button className="modal-close" onClick={closeModal} type="button">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-body" data-lenis-prevent="true">
                <div className="form-field">
                  <label>Feast / Dish Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Mutton Dum Biryani Feast"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Cooking Date *</label>
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="special-event">Special Event</option>
                      <option value="weekend-feast">Weekend Feast</option>
                      <option value="festival">Festival Special</option>
                      <option value="wedding">Wedding / Function</option>
                      <option value="daily-menu">Daily Menu</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Fulfillment Availability</label>
                  <select
                    value={form.deliveryOption}
                    onChange={(e) => setForm({ ...form, deliveryOption: e.target.value })}
                  >
                    <option value="Both">🚚 Doorstep Delivery & 🛍️ Self Service (Kitchen Pickup)</option>
                    <option value="Delivery">🚚 Doorstep Delivery Only</option>
                    <option value="Self Service">🛍️ Self Service (Kitchen Pickup Only)</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Portion / Serving Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. 1 Kg Bucket (4-5 Persons) or Packet"
                      value={form.portionUnit}
                      onChange={(e) => setForm({ ...form, portionUnit: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Base Price Per Unit (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 1800"
                      value={form.pricePerPacket}
                      onChange={(e) => setForm({ ...form, pricePerPacket: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label>Min Units to Order</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={form.minPackets}
                      onChange={(e) => setForm({ ...form, minPackets: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Included Menu Items (Separate with commas)</label>
                  <input
                    type="text"
                    placeholder="e.g. Mutton Dum Biryani, Boiled Egg, Brinjal Dalcha, Onion Raitha, Bread Halwa"
                    value={form.menuItems}
                    onChange={(e) => setForm({ ...form, menuItems: e.target.value })}
                  />
                  <small
                    style={{
                      color: '#7a6358',
                      fontSize: '0.78rem',
                      marginTop: '0.2rem',
                      display: 'block',
                    }}
                  >
                    Tip: Separate each item with a comma so they appear as clean highlight tags!
                  </small>
                </div>

                {/* EXTRA SIDE DISHES BUILDER WITH PORTION / GRAMMAGE */}
                <div
                  className="form-field"
                  style={{
                    background: '#faf6ef',
                    border: '1px solid #ebd0b3',
                    borderRadius: '8px',
                    padding: '0.85rem',
                  }}
                >
                  <label style={{ fontWeight: '700', color: '#6d421d' }}>
                    🍗 Mention Extra Side Dishes &amp; Add-ons (Custom Portions &amp; Grammage)
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#7a6358', margin: '0.2rem 0 0.6rem' }}>
                    Configure optional sides customers can add to this feast (e.g. Chicken 65 with 250g portion, Bread Halwa 200g):
                  </p>
                  <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Dish Name (e.g. Chicken 65)"
                      value={newExtraName}
                      onChange={(e) => setNewExtraName(e.target.value)}
                      style={{ flex: '2 1 140px' }}
                    />
                    <input
                      type="text"
                      placeholder="Portion/Grammage (e.g. 250g / 4 pcs)"
                      value={newExtraPortion}
                      onChange={(e) => setNewExtraPortion(e.target.value)}
                      style={{ flex: '2 1 140px' }}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Price (₹)"
                      value={newExtraPrice}
                      onChange={(e) => setNewExtraPrice(e.target.value)}
                      style={{ flex: '1 1 80px' }}
                    />
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={addExtraDish}
                    >
                      + Add Add-on
                    </button>
                  </div>

                  {Array.isArray(form.extraSideDishes) && form.extraSideDishes.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {form.extraSideDishes.map((ex, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #dcb58c',
                            borderRadius: '6px',
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            color: '#4a2815',
                            fontWeight: '600',
                          }}
                        >
                          🍗 {ex.name} {ex.portion ? `(${ex.portion})` : ''} (+₹{ex.price})
                          <button
                            type="button"
                            onClick={() => removeExtraDish(idx)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#b5482c',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                            }}
                            title="Remove side dish"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* PROMOTIONAL WEB DISCOUNT RULES */}
                <div
                  className="form-field"
                  style={{
                    background: '#f5fbf7',
                    border: '1px solid #b7e4c7',
                    borderRadius: '8px',
                    padding: '0.85rem',
                  }}
                >
                  <label style={{ fontWeight: '700', color: '#1b4332' }}>
                    🏷️ Promotional Web Order Discount Rules
                  </label>
                  <p style={{ fontSize: '0.8rem', color: '#2d6a4f', margin: '0.2rem 0 0.6rem' }}>
                    Promotional discount automatically applied for customers ordering online:
                  </p>
                  <div className="form-row">
                    <div className="form-field" style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.82rem', color: '#1b4332' }}>Discount Type</label>
                      <select
                        value={form.discountType}
                        onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                      >
                        <option value="none">No Discount</option>
                        <option value="percentage">Percentage Off (%)</option>
                        <option value="flat">Flat Rate Off (₹)</option>
                      </select>
                    </div>
                    {form.discountType !== 'none' && (
                      <div className="form-field" style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.82rem', color: '#1b4332' }}>
                          {form.discountType === 'percentage'
                            ? 'Discount Percentage (%)'
                            : 'Flat Discount Amount (₹)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step={form.discountType === 'percentage' ? '1' : '10'}
                          placeholder={
                            form.discountType === 'percentage'
                              ? 'e.g. 10 (for 10% off)'
                              : 'e.g. 200 (for ₹200 off)'
                          }
                          value={form.discountValue}
                          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                          required={form.discountType !== 'none'}
                        />
                      </div>
                    )}
                  </div>
                  {form.discountType !== 'none' && Number(form.discountValue) > 0 && (
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: '#155724',
                        background: '#d4edda',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '4px',
                        marginTop: '0.4rem',
                        fontWeight: '600',
                      }}
                    >
                      ✓ Live Rule: Customers get{' '}
                      {form.discountType === 'percentage'
                        ? `${form.discountValue}% instant discount`
                        : `₹${form.discountValue} flat discount`}{' '}
                      applied automatically at checkout!
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>Description / Special Notes</label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Cooked with authentic seeraga samba rice and wood-fire tradition. Pre-orders close 24 hours prior."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Banner Image (Optional)</label>
                  {form.images?.[0] ? (
                    <div className="image-preview-box">
                      <img src={form.images[0]} alt="Banner Preview" />
                      <div className="image-preview-overlay">
                        <span className="image-url-tag">Cooking Banner Photo</span>
                        <button type="button" className="btn-remove-img" onClick={removeImage}>
                          ✕ Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*"
                        id="cooking-banner-file"
                        onChange={handleImageFile}
                        disabled={uploading}
                      />
                      <label htmlFor="cooking-banner-file" className="upload-dropzone__label">
                        {uploading ? (
                          <div className="upload-spinner">
                            <div className="spinner"></div>
                            <span>Uploading banner photo...</span>
                          </div>
                        ) : (
                          <>
                            <span className="upload-icon">📷</span>
                            <span className="upload-title">Click to Upload Banner Photo</span>
                            <span className="upload-sub">Auto-optimizes &amp; uploads to Cloudinary</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className={`admin-toggle-switch-card ${form.isPreOrderActive ? 'is-active' : ''}`}>
                  <div className="toggle-info">
                    <div className="toggle-title-row">
                      <span className="toggle-icon">🔥</span>
                      <strong>Pre-Orders Enabled for this Date</strong>
                    </div>
                    <span className="toggle-hint">
                      Active in Customer Pre-Order Column with real-time price calculations
                    </span>
                  </div>
                  <label className="switch-control" htmlFor="preorder-toggle-switch">
                    <input
                      type="checkbox"
                      id="preorder-toggle-switch"
                      checked={form.isPreOrderActive}
                      onChange={(e) => setForm({ ...form, isPreOrderActive: e.target.checked })}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className={`admin-toggle-switch-card ${form.isActive ? 'is-active' : ''}`}>
                  <div className="toggle-info">
                    <div className="toggle-title-row">
                      <span className="toggle-icon">🌐</span>
                      <strong>Active Announcement</strong>
                    </div>
                    <span className="toggle-hint">
                      Visible publicly on the website home and catering pages
                    </span>
                  </div>
                  <label className="switch-control" htmlFor="announcement-toggle-switch">
                    <input
                      type="checkbox"
                      id="announcement-toggle-switch"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting || uploading}
                >
                  {submitting
                    ? 'Saving Announcement...'
                    : editingId
                    ? 'Update Announcement'
                    : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
