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
export default function FloatingCard({
  icon,
  title,
  subtitle,
  badge,
  delay = 0,
  style,
  onClick,
  className = '',
  ariaLabel,
}) {
  const isClickable = typeof onClick === 'function';

  return (
    <motion.div
      className={`floating-card ${isClickable ? 'floating-card--clickable' : ''} ${className}`}
      style={style}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel || (typeof title === 'string' ? `${title}: ${subtitle || ''}` : undefined)}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: [0, -10, 0],
        scale: 1,
      }}
      whileHover={isClickable ? { scale: 1.06, y: -8 } : undefined}
      whileTap={isClickable ? { scale: 0.96 } : undefined}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.6 },
      }}
    >
      {icon && <span className="floating-card__icon">{icon}</span>}
      <div className="floating-card__content">
        <div className="floating-card__header-row">
          <p className="floating-card__title">{title}</p>
          {badge && <span className="floating-card__badge">{badge}</span>}
        </div>
        {subtitle && <p className="floating-card__subtitle">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
