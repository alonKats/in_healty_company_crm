/**
 * Normalize Israeli phone number for WhatsApp wa.me link.
 * Strips spaces, dashes, parentheses, leading 0. Prepends 972.
 * Returns null if input is empty or too short.
 */
export function toWhatsAppLink(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[\s\-\(\)]/g, "");
  if (digits.length < 9) return null;
  const normalized = digits.startsWith("0") ? digits.slice(1) : digits;
  return `https://wa.me/972${normalized}`;
}
