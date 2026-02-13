/**
 * Report Design System Constants
 *
 * Defines the visual language for consulting-grade PDF reports:
 * - Dark navy authority aesthetic
 * - Clean typography hierarchy
 * - Strategic use of color for insight severity
 */

export const REPORT_COLORS = {
  navy: '#1B2A4A',
  charcoal: '#2D3436',
  warm: '#F8F7F4',
  blue: '#2E6EA6',
  amber: '#D4930D',
  red: '#C0392B',
  green: '#27864A',
  gray: '#6B7280',
  white: '#FFFFFF',
} as const;

export const REPORT_TYPOGRAPHY = {
  // PDF sizes in points
  pdf: {
    hero: 56,           // 48-64pt hero numbers
    title: 24,          // Section titles
    subsection: 18,     // Subsection titles
    callout: 16,        // Callout text
    body: 11,           // Body narrative
    caption: 9,         // Captions, labels
  },
  // Screen sizes in pixels (for HTML preview)
  screen: {
    hero: 56,           // Same as PDF for consistency
    title: 24,
    subsection: 18,
    callout: 16,
    body: 14,           // Slightly larger for screen readability
    caption: 12,
  },
  // Font weights
  weight: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },
  // Line heights
  leading: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const REPORT_PAGE = {
  // A4 dimensions in millimeters
  width: 210,
  height: 297,
  // Margins in millimeters (1 inch = 25.4mm)
  margins: {
    top: 25.4,
    right: 25.4,
    bottom: 25.4,
    left: 25.4,
  },
  // Content width in millimeters (6.5 inches = 165.1mm)
  contentWidth: 165.1,
  // Gutter for two-column layouts
  gutter: 12.7,  // 0.5 inch
} as const;

/**
 * Severity levels mapped to colors
 */
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'positive';

export type SeverityColor = {
  [K in SeverityLevel]: string;
};

export const SEVERITY_COLORS: SeverityColor = {
  critical: REPORT_COLORS.red,
  high: REPORT_COLORS.amber,
  medium: REPORT_COLORS.blue,
  low: REPORT_COLORS.gray,
  positive: REPORT_COLORS.green,
} as const;

/**
 * Chart configuration defaults
 */
export const CHART_DEFAULTS = {
  // Maximum colors per chart
  maxColors: 3,
  // Bar chart dimensions
  bar: {
    height: 32,           // px
    gap: 8,               // px
    labelWidth: 120,      // px
  },
  // Progress bar dimensions
  progress: {
    height: 24,           // px
    trackOpacity: 0.2,
  },
  // Dot plot dimensions
  dotPlot: {
    height: 60,           // px
    dotSize: 12,          // px
  },
  // Gauge dimensions
  gauge: {
    width: 200,           // px
    height: 120,          // px
  },
} as const;

/**
 * Brand footer configuration
 */
export const REPORT_FOOTER = {
  text: 'World Consulting Group',
  url: 'worldconsultinggroup.com',
  separator: ' | ',
} as const;
