// Simple invite code system - codes stored in environment or config
// For MVP: hardcoded list, later: database or API validation

const VALID_CODES = new Set([
  // DEMO & TESTING
  'VWCG-DEMO-2026',

  // BETA ACCESS
  'VWCG-BETA-001',
  'VWCG-BETA-002',
  'VWCG-BETA-003',

  // PARTNER ACCESS
  'VWCG-PARTNER-001',
  'VWCG-CLIENT-001',
  'VWCG-CLIENT-002',
  'VWCG-VIP-2026',

  // GENERAL ACCESS — Batch 1
  'VWCG-S94Y2-8ACYX-TK833',
  'VWCG-MWPBT-FZNTJ-355LT',
  'VWCG-9VAD3-4ZJ2N-Y5D4F',
  'VWCG-CAFPC-DAAU7-S3N75',
  'VWCG-TXWLB-B2HJD-T8VJB',
  'VWCG-T3W23-LBEXX-E4S6S',
  'VWCG-RMBQC-FMSZV-TTNM5',
  'VWCG-REM73-G3ZU6-SAF3D',
  'VWCG-ZH3LR-QZKD3-FQQEJ',
  'VWCG-3QFAL-RM2M2-R4MWG',

  // PPC CAMPAIGN CODES
  'VWCG-XCNFG-D7PWF-QCHXT',
  'VWCG-UW6T8-EMQBA-2K63Z',
  'VWCG-RG3UB-S7YUC-ZBTN2',
  'VWCG-XYDFW-SXNW8-JVH5P',
  'VWCG-RUBPX-SBQ6L-BZ44J',
  'VWCG-S8D4L-LEBFP-CU66Z',
  'VWCG-UBBAC-265C2-WP94L',
  'VWCG-C54AN-YVHWN-5D737',
  'VWCG-7TW5A-ZXN3X-9V5T6',
  'VWCG-5YGTH-LNYNE-63LWH',

  // OUTREACH CODES
  'VWCG-WZ4ZR-TE5SC-7NEN5',
  'VWCG-3M74H-VNNDB-AQ24V',
  'VWCG-NFM4W-XMBKD-H3YU9',
  'VWCG-ZKHVK-AW7KW-E7ZLP',
  'VWCG-36D89-XG3AW-XW37T',
  'VWCG-QDKPG-S35RH-5JPT9',
  'VWCG-XMK6B-P7HH3-C4NDS',
  'VWCG-QGULH-6G9SZ-HDJTK',
  'VWCG-75VUR-8BC2P-NS3F4',
  'VWCG-PL879-WZTB3-6R4EW',
]);

// Check if running in development mode
const isDev = import.meta.env.DEV;

export function validateInviteCode(code: string): boolean {
  // In development, accept any non-empty code for testing
  if (isDev && code.trim().length > 0) {
    return true;
  }

  // Normalize code: uppercase, trim whitespace
  const normalizedCode = code.toUpperCase().trim();
  return VALID_CODES.has(normalizedCode);
}

export function generateInviteCode(prefix: string = 'VWCG'): string {
  // Generate a random code for new invites
  // Format: PREFIX-XXXX-XXXX
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes ambiguous chars
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment1}-${segment2}`;
}

export function formatInviteCode(code: string): string {
  // Format code for display (uppercase with dashes)
  return code.toUpperCase().trim();
}
