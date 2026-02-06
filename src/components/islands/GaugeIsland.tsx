import { useInView } from 'react-intersection-observer';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEffect, useState } from 'react';

interface GaugeIslandProps {
  value: number;           // Target percentage (0-100)
  label: string;           // Score label (e.g., "AI Readiness")
  duration?: number;       // Animation duration in seconds (default: 2.0)
  color?: string;          // Gauge color (default: indigo-600)
  description: string;     // Accessible description for screen readers
}

/**
 * GaugeIsland - Animated circular gauge with viewport detection
 *
 * Features:
 * - Triggers count-up animation when component enters viewport
 * - Respects prefers-reduced-motion (shows final value instantly)
 * - Accessible with aria-label for screen readers
 * - GPU-friendly animations (only animates SVG stroke-dashoffset and text)
 * - Triggers once (doesn't re-animate on scroll)
 *
 * Usage:
 * <GaugeIsland
 *   value={85}
 *   label="AI Readiness"
 *   duration={2.0}
 *   color="#4F46E5"
 *   description="AI Readiness score: 85 out of 100"
 *   client:visible
 * />
 */
export default function GaugeIsland({
  value,
  label,
  duration = 2.0,
  color = '#4F46E5', // indigo-600
  description
}: GaugeIslandProps) {
  // Detect when component enters viewport (trigger once)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3 // Start animation when 30% visible
  });

  // Check user's motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Track animated value for smooth count-up
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Check if user has enabled reduced motion in their OS/browser settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes to motion preference
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Only animate when in view
    if (!inView) return;

    // If reduced motion, show final value instantly
    if (prefersReducedMotion) {
      setAnimatedValue(value);
      return;
    }

    // Animate from 0 to target value using requestAnimationFrame
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      // easeOutQuart easing function for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      const current = Math.round(easedProgress * value);
      setAnimatedValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, value, duration, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={description}
      className="flex flex-col items-center"
    >
      <div className="w-28 h-28">
        <CircularProgressbar
          value={animatedValue}
          text={`${animatedValue}%`}
          styles={buildStyles({
            // Rotation (starts from top)
            rotation: 0,

            // Stroke colors
            pathColor: color,
            textColor: color,
            trailColor: '#E5E7EB', // gray-200

            // Stroke widths
            pathTransitionDuration: 0.05, // Smooth update for requestAnimationFrame

            // Text styling
            textSize: '22px',
          })}
        />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-600 text-center">
        {label}
      </p>
    </div>
  );
}
