import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import Hero3D from '../components/Hero3D.jsx';
import FloatingCard from '../components/FloatingCard.jsx';
import RevealText from '../components/RevealText.jsx';
import HorizontalGallery from '../components/HorizontalGallery.jsx';
import miCateringLogo from '../assets/mi-catering-logo.png';
import ibrahimLogo from '../assets/ibrahim-logo.png';
import aafiyaLogo from '../assets/aafiya-logo.png';
import './Home.scss';

const galleryItems = [
  { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=700', caption: 'Wedding Catering' },
  { src: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=700', caption: 'Stone-Ground Masala' },
  { src: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=700', caption: 'Cold-Pressed Oils' },
  { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=700', caption: 'Corporate Events' },
  { src: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=700&sat=-20', caption: 'Spice Blending' },
];

const businesses = [
  {
    key: 'catering',
    name: 'MI Catering Services',
    tagline: 'Authentic flavors, memorable events',
    color: '#b5482c',
    to: '/catering',
    img: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800',
    logo: miCateringLogo,
  },
  {
    key: 'masala',
    name: 'Ibrahim Masala Mill',
    tagline: 'Freshly stone-ground spice tradition',
    color: '#d97b1f',
    to: '/masala-mill',
    img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800',
    logo: ibrahimLogo,
  },
  {
    key: 'oil',
    name: 'Aafiya Cold Pressed Oils',
    tagline: 'Pure Cold-Pressed Oils',
    color: '#4f6b3b',
    to: '/cold-press-oil',
    img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=800',
    logo: aafiyaLogo,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [cookingAnnouncements, setCookingAnnouncements] = useState([]);

  useEffect(() => {
    api
      .get('/catering/events')
      .then((res) => {
        if (Array.isArray(res.data?.data)) {
          const active = res.data.data.filter((e) => e.eventDate && e.isActive !== false);
          setCookingAnnouncements(active);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <Hero3D />

        <FloatingCard
          icon="⭐"
          title="4.9/5 Rating"
          subtitle="1.2K+ Happy Customers"
          delay={0.9}
          style={{ top: '22%', left: '6%' }}
        />
        <FloatingCard
          icon="🍛"
          title="500+ Events"
          subtitle="Catered With Care"
          delay={1.1}
          style={{ top: '18%', right: '6%' }}
        />
        <FloatingCard
          icon="🌿"
          title="FSSAI Certified"
          subtitle="Hygiene Guaranteed"
          delay={1.3}
          style={{ bottom: '16%', left: '10%' }}
        />

        <div className="hero__content container">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Trusted since generations
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            MI <span>Groups</span>
          </motion.h1>
          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Three trusted family businesses — premium catering, stone-ground masala, and
            traditional cold-pressed oils — united under one name you can rely on.
          </motion.p>
          <motion.div
            className="hero__ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <Link to="/catering" className="btn btn--primary">
              Explore Catering
            </Link>
            <a href="#businesses" className="btn btn--outline">
              View All Businesses
            </a>
          </motion.div>
        </div>

        <div className="hero__curve" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
            <path
              d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z"
              fill="#fdfbf7"
            />
          </svg>
        </div>
      </section>

      <section id="businesses" className="section businesses">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Our Businesses</span>
            <h2>One Family, Three Legacies</h2>
            <p>
              Each business carries its own identity and craftsmanship, backed by the same MI
              Groups promise of quality and trust.
            </p>
          </div>

          <div className="grid grid--3">
            {businesses.map((b, i) => (
              <motion.div
                key={b.key}
                className="business-card"
                style={{ '--accent': b.color }}
                onClick={(e) => {
                  // Only navigate if user did not click directly on an inner anchor or button
                  if (!e.target.closest('a') && !e.target.closest('button')) {
                    navigate(b.to);
                  }
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <Link
                  to={b.to}
                  className="business-card__img"
                  style={{ backgroundImage: `url(${b.img})` }}
                  aria-label={`Open ${b.name}`}
                >
                  {b.logo && (
                    <div className="business-card__logo-badge">
                      <img src={b.logo} alt={`${b.name} logo`} />
                    </div>
                  )}
                </Link>
                <div className="business-card__body">
                  <h3>
                    <Link to={b.to}>{b.name}</Link>
                  </h3>
                  <p>{b.tagline}</p>
                  {b.key === 'catering' && cookingAnnouncements.length > 0 && (
                    <div className="card-cooking-alert">
                      <span className="alert-pulse"></span>
                      <span className="alert-text">
                        📢 Special Cooking on{' '}
                        <strong>
                          {new Date(cookingAnnouncements[0].eventDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </strong>
                        : {cookingAnnouncements[0].title}
                      </span>
                    </div>
                  )}
                  <Link to={b.to} className="btn btn--primary">
                    {b.key === 'catering' && cookingAnnouncements.length > 0
                      ? 'Pre-Order / Learn More →'
                      : 'Learn More →'}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section gallery-section">
        <div className="section-heading container">
          <span className="eyebrow">Our Work</span>
          <RevealText as="h2">Craft, Care and Tradition — In Every Frame</RevealText>
        </div>
        <HorizontalGallery items={galleryItems} />
      </section>

      <section className="section section--alt why">
        <div className="container grid grid--2">
          <div>
            <span className="eyebrow">Why MI Groups</span>
            <RevealText as="h2">Quality You Can Taste, Trust You Can Feel</RevealText>
            <p>
              From FSSAI-certified catering kitchens to traditional cold pressed oil mills, every
              MI Groups business is run with the same family values — hygiene, honesty, and
              genuine craftsmanship passed down through generations.
            </p>
            <ul className="why__list">
              <li><span className="check-icon">✓</span> FSSAI Licensed Catering Operations</li>
              <li><span className="check-icon">✓</span> Stone-ground, preservative-free masalas</li>
              <li><span className="check-icon">✓</span> Traditional cold-press extraction</li>
              <li><span className="check-icon">✓</span> Direct-from-family, no middlemen pricing</li>
            </ul>

            <div className="why__open-invite">
              <div className="invite-badge">
                <span className="invite-badge__icon">🏡</span>
                <span className="invite-badge__label">Open Invite</span>
              </div>
              <p className="invite-text">
                “You’re most welcome to visit us directly and see firsthand how we prepare your order with care, cleanliness, and tradition.”
              </p>
            </div>
          </div>
          <div className="why__stats grid grid--2">
            <div className="card stat-card">
              <h3 className="stat-card__num">10+</h3>
              <p className="stat-card__label">Years of Family Trust</p>
            </div>
            <div className="card stat-card">
              <h3 className="stat-card__num">500+</h3>
              <p className="stat-card__label">Events Catered</p>
            </div>
            <div className="card stat-card">
              <h3 className="stat-card__num">100%</h3>
              <p className="stat-card__label">Stone-Ground Purity</p>
            </div>
            <div className="card stat-card">
              <h3 className="stat-card__num">Pure</h3>
              <p className="stat-card__label">Cold-Pressed Oils</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
