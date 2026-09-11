import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client';
import AdminSidebar from '../components/admin/AdminSidebar.jsx';
import AdminTopbar from '../components/admin/AdminTopbar.jsx';
import OverviewPanel from '../components/admin/OverviewPanel.jsx';
import CookingAnnouncementsPanel from '../components/admin/CookingAnnouncementsPanel.jsx';
import CateringOrdersPanel from '../components/admin/CateringOrdersPanel.jsx';
import CateringGalleryPanel from '../components/admin/CateringGalleryPanel.jsx';
import EnquiryPanel from '../components/admin/EnquiryPanel.jsx';
import MasalaProductsPanel from '../components/admin/MasalaProductsPanel.jsx';
import OilProductsPanel from '../components/admin/OilProductsPanel.jsx';
import './AdminDashboard.scss';

const TABS = [
  { id: 'Overview', label: 'Overview', icon: '📊' },
  { id: 'Cooking Announcements', label: 'Cooking Announcements', icon: '📢' },
  { id: 'Catering Orders', label: 'Catering Orders', icon: '🍽️' },
  { id: 'Catering Gallery', label: 'Catering Gallery', icon: '🍛' },
  { id: 'Masala Products', label: 'Masala Products', icon: '🧂' },
  { id: 'Masala Enquiries', label: 'Masala Enquiries', icon: '🌶️' },
  { id: 'Oil Products', label: 'Oil Products', icon: '🫒' },
  { id: 'Oil Enquiries', label: 'Oil Enquiries', icon: '📋' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [summary, setSummary] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    api.get('/admin/summary').then((res) => setSummary(res.data?.data)).catch(() => {});
  }, [tab]);

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        tabs={TABS}
        currentTab={tab}
        onSelectTab={setTab}
        summary={summary}
        mobileNavOpen={mobileNavOpen}
        onCloseMobileNav={() => setMobileNavOpen(false)}
        user={user}
        onLogout={logout}
      />

      <main className="admin-dashboard__content">
        <AdminTopbar
          tab={tab}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        />

        <div className="admin-dashboard__body">
          {tab === 'Overview' && <OverviewPanel summary={summary} onSelectTab={setTab} />}
          {tab === 'Cooking Announcements' && <CookingAnnouncementsPanel />}
          {tab === 'Catering Orders' && <CateringOrdersPanel />}
          {tab === 'Catering Gallery' && <CateringGalleryPanel />}
          {tab === 'Masala Products' && <MasalaProductsPanel />}
          {tab === 'Masala Enquiries' && <EnquiryPanel resource="masala" itemLabel="Product" />}
          {tab === 'Oil Products' && <OilProductsPanel />}
          {tab === 'Oil Enquiries' && <EnquiryPanel resource="oil" itemLabel="Product" />}
        </div>
      </main>
    </div>
  );
}
