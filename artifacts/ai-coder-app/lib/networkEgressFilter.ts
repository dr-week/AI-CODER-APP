/**
 * Sandbox Network Egress Filter
 * Enforces strict domain allowlisting to block unauthorized outbound traffic
 * from sandbox execution containers.
 */

export const ALLOWED_EGRESS_DOMAINS = [
  'api.github.com',
  'api.groq.com',
  'generativelanguage.googleapis.com',
  'openrouter.ai',
  'api.openai.com',
  'api.anthropic.com',
  'supabase.co',
  'vercel.app',
  'netlify.app',
];

export function validateNetworkEgress(targetUrlString: string): { allowed: boolean; domain?: string; reason?: string } {
  try {
    const parsed = new URL(targetUrlString);
    const hostname = parsed.hostname.toLowerCase();

    const isAllowed = ALLOWED_EGRESS_DOMAINS.some(allowed => hostname === allowed || hostname.endsWith(`.${allowed}`));

    if (!isAllowed) {
      return {
        allowed: false,
        domain: hostname,
        reason: `Egress blocked: Destination domain "${hostname}" is not in the explicit security allowlist.`,
      };
    }

    return { allowed: true, domain: hostname };
  } catch (e) {
    return { allowed: false, reason: 'Invalid destination URL format.' };
  }
}
