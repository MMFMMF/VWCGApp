// Simple invite code system - codes stored in environment or config
// For MVP: hardcoded list, later: database or API validation

const VALID_CODES = new Set([
  'VWCG-DEMO-2026',
  'VWCG-BETA-001',
  'VWCG-BETA-002',
  'VWCG-BETA-003',
  'VWCG-PARTNER-001',
  // Add more codes as needed
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
