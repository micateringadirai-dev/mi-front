import { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import FloatingCartButton from './components/FloatingCartButton.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';
import LogoIntro from './components/LogoIntro.jsx';
import AdPopup from './components/AdPopup.jsx';
import { CartProvider } from './context/CartContext.jsx';

import Home from './pages/Home.jsx';
import Catering from './pages/Catering.jsx';
import MasalaMill from './pages/MasalaMill.jsx';
import ColdPressOil from './pages/ColdPressOil.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const location = useLocation();
  // Show the signature draw-in intro once per browser session, only on
  // the public site (skip it for the admin panel).
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem('mi_intro_seen') === '1');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleIntroComplete = () => {
    sessionStorage.setItem('mi_intro_seen', '1');
    setIntroDone(true);
  };

  return (
    <CartProvider>
      <SmoothScroll>
        {!introDone && !isAdminRoute && <LogoIntro onComplete={handleIntroComplete} />}
        {!isAdminRoute && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/masala-mill" element={<MasalaMill />} />
            <Route path="/cold-press-oil" element={<ColdPressOil />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <WhatsAppButton />}
        {!isAdminRoute && <FloatingCartButton />}
        {!isAdminRoute && <AdPopup />}
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  );
}
