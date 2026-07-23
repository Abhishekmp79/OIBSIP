/**
 * Validation helpers used across forms.
 */

/** Email shape check. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** At least 8 characters. */
export function isValidPassword(pw: string): boolean {
  return typeof pw === 'string' && pw.length >= 8;
}

/** 10-digit Indian phone (allows +91, spaces, dashes). */
export function isValidPhone(phone: string): boolean {
  return /^[+]?[\d\s-]{10,15}$/.test(phone.trim());
}

/** 6-digit pincode. */
export function isValidPincode(pin: string): boolean {
  return /^\d{6}$/.test(String(pin).trim());
}

/** Password strength meter (0–4). */
export function passwordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#999', '#dc2626', '#f59e0b', '#3b82f6', '#16a34a'];
  return { score, label: labels[score], color: colors[score] };
}
