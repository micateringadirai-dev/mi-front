import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import './AdminDashboard.scss';

const TABS = ['Overview', 'Catering Orders', 'Masala Enquiries', 'Oil Enquiries'];

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
        <h3>MI Groups Admin</h3>
        <p className="admin-dashboard__user">{user?.name} ({user?.role})</p>
        <nav>
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
        <button className="btn btn--outline logout-btn" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-dashboard__content">
        {tab === 'Overview' && <Overview summary={summary} />}
        {tab === 'Catering Orders' && <CateringOrders />}
        {tab === 'Masala Enquiries' && <EnquiryPanel resource="masala" itemLabel="Product" />}
        {tab === 'Oil Enquiries' && <EnquiryPanel resource="oil" itemLabel="Product" />}
      </main>
    </div>
  );
}

function Overview({ summary }) {
  if (!summary) return <p>Loading summary...</p>;
  return (
    <div>
      <h2>Overview</h2>
      <div className="grid grid--3 overview-cards">
        <div className="card"><h3>{summary.pendingCatering}</h3><p>Pending Catering Orders</p></div>
        <div className="card"><h3>{summary.newMasala}</h3><p>New Masala Enquiries</p></div>
        <div className="card"><h3>{summary.newOil}</h3><p>New Oil Enquiries</p></div>
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
      setOrders(res.data.data);
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
    <div>
      <h2>Catering Orders</h2>

      <div className="filters-bar">
        <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input placeholder="Search name / mobile / item" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <button className="btn btn--primary" onClick={fetchOrders}>Apply</button>
        <button className="btn btn--outline" onClick={exportExcel}>⬇ Export Excel</button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Item / Event</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Packets</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.itemName}</td>
                <td>{o.customerName}</td>
                <td>{o.mobileNumber}</td>
                <td>{o.numberOfPackets}</td>
                <td>{new Date(o.orderDate).toDateString()}</td>
                <td>
                  <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                    {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders found</td></tr>
            )}
          </tbody>
        </table>
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
      setRows(res.data.data);
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

  return (
    <div>
      <h2>{resource === 'masala' ? 'Masala Mill Enquiries' : 'Cold Press Oil Enquiries'}</h2>

      <div className="filters-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['New', 'Contacted', 'Confirmed', 'Closed'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input placeholder="Search name / phone / product" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn--primary" onClick={fetchRows}>Apply</button>
        <button className="btn btn--outline" onClick={exportExcel}>⬇ Export Excel</button>
      </div>

      {loading ? (
        <p>Loading enquiries...</p>
      ) : (
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
                <td>{r.productName}</td>
                <td>{r.customerName}</td>
                <td>{r.phoneNumber}</td>
                <td>
                  <select value={r.status} onChange={(e) => updateStatus(r._id, e.target.value)}>
                    {['New', 'Contacted', 'Confirmed', 'Closed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No enquiries found</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
