import { useInView } from 'react-intersection-observer';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';

interface CounterIslandProps {
  end: number;
  suffix?: string;
  duration?: number;
  description: string;
}

/**
 * CounterIsland - Animated number counter with viewport detection
 *
 * Features:
 * - Triggers count-up animation when component enters viewport
 * - Respects prefers-reduced-motion (shows final value instantly)
 * - Accessible with aria-label for screen readers
 * - Triggers once (doesn't re-animate on scroll)
 *
 * Usage:
 * <CounterIsland
 *   end={500}
 *   suffix="+"
 *   duration={2.5}
 *   description="500 plus business owners served"
 *   client:visible
 * />
 */
export default function CounterIsland({
  end,
  suffix = '',
  duration = 2.5,
  description
}: CounterIslandProps) {
  // Detect when component enters viewport (trigger once)
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3 // Start animation when 30% visible
  });

  // Check user's motion preferences
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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

  return (
    <span
      ref={ref}
      aria-label={description}
      className="inline-block tabular-nums"
    >
      {inView && (
        <CountUp
          start={0}
          end={end}
          suffix={suffix}
          duration={prefersReducedMotion ? 0 : duration}
          separator=","
          useEasing={!prefersReducedMotion}
          easingFn={(t, b, c, d) => {
            // Custom easing: easeOutQuart for smooth deceleration
            t /= d;
            t--;
            return -c * (t * t * t * t - 1) + b;
          }}
        />
      )}
    </span>
  );
}
