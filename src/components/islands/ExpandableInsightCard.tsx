import { useState } from 'react';

interface ExpandableInsightCardProps {
  severity: 'high' | 'medium' | 'info' | 'opportunity';
  title: string;
  summary: string;        // Short preview text (always visible)
  details: string;        // Full analysis text (visible when expanded)
}

/**
 * ExpandableInsightCard - Click-to-expand insight card
 *
 * Features:
 * - Expands/collapses on click with smooth animation
 * - No layout shift (uses grid-template-rows technique)
 * - Hover interactions (shadow + optional scale)
 * - Accessible (aria-expanded, role=button, keyboard support)
 * - GPU-friendly animations (transform + opacity only)
 * - Severity-based color coding
 *
 * Usage:
 * <ExpandableInsightCard
 *   severity="high"
 *   title="Critical Data Gap"
 *   summary="Your business lacks structured customer data..."
 *   details="Without centralized customer data, you cannot segment audiences..."
 *   client:visible
 * />
 */
export default function ExpandableInsightCard({
  severity,
  title,
  summary,
  details
}: ExpandableInsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Severity-based styling configuration
  const severityConfig = {
    high: {
      border: 'border-red-500',
      bg: 'bg-red-50',
      badge: 'bg-red-100 text-red-800',
      label: 'High Priority'
    },
    medium: {
      border: 'border-amber-500',
      bg: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-800',
      label: 'Medium Priority'
    },
    info: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      badge: 'bg-green-100 text-green-800',
      label: 'Strength'
    },
    opportunity: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
      label: 'Opportunity'
    }
  };

  const config = severityConfig[severity];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support Enter and Space keys for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-controls={`insight-details-${title.replace(/\s+/g, '-').toLowerCase()}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`
        ${config.bg}
        ${config.border}
        border-l-4
        rounded-lg
        p-4
        cursor-pointer
        transition-all
        duration-200
        ease-out
        hover:shadow-md
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-indigo-500
        focus-visible:ring-offset-2
        shadow-sm
      `}
      style={{
        // Slight scale on hover for interaction feedback
        transform: 'scale(1)',
        willChange: 'transform, box-shadow'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.01)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Header with severity badge and chevron */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`
              ${config.badge}
              text-xs
              font-semibold
              px-2
              py-1
              rounded
              uppercase
              tracking-wide
            `}>
              {config.label}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Chevron icon - rotates when expanded */}
        <svg
          className="w-5 h-5 text-gray-500 transition-transform duration-200 ease-out flex-shrink-0"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Summary - always visible */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {summary}
      </p>

      {/* Details - revealed on expand using grid-rows technique */}
      <div
        className={`
          grid
          transition-all
          duration-300
          ease-out
          ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div
            id={`insight-details-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={`
              pt-3
              border-t
              border-gray-200
              mt-3
              transition-opacity
              duration-300
              ${isExpanded ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <p className="text-sm text-gray-600 leading-relaxed">
              {details}
            </p>
          </div>
        </div>
      </div>

      {/* Expand/collapse hint text */}
      <div className="mt-2 text-xs text-gray-500 font-medium">
        {isExpanded ? 'Click to collapse' : 'Click to read more'}
      </div>
    </div>
  );
}
