import { motion } from 'framer-motion';
import './FloatingCard.scss';

/**
 * A small glassy "notification" card that floats and gently bobs near a
 * hero image — the little "Loved by 1.2K+", stat-badge style elements
 * seen layered over the product photo in the reference video.
 *
 * Usage:
 * <FloatingCard icon="⭐" title="4.9/5 Rating" subtitle="500+ Reviews" delay={0.4} style={{ top: '20%', left: '5%' }} />
 */
export default function FloatingCard({ icon, title, subtitle, delay = 0, style }) {
  return (
    <motion.div
      className="floating-card"
      style={style}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 },
      }}
    >
      {icon && <span className="floating-card__icon">{icon}</span>}
      <div>
        <p className="floating-card__title">{title}</p>
        {subtitle && <p className="floating-card__subtitle">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
