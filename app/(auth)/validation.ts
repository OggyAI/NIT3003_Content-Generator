// Shared validation for register/login.
// Imported by the browser (instant feedback) AND the server action (the real check),
// so the two can never drift apart. NFR-01: 8+ chars, upper, lower, number, special.

export const PASSWORD_RULES: { label: string; test: (p: string) => boolean }[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A special character (e.g. ! @ # $)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterFields = {
  email: string;
  password: string;
  businessName: string;
};

export type FieldErrors = Partial<Record<keyof RegisterFields, string>>;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Enter your email address.";
  if (!EMAIL_RE.test(email.trim())) return "Enter a valid email, like name@business.com.";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Enter a password.";
  const missing = PASSWORD_RULES.filter((r) => !r.test(password));
  if (missing.length) {
    return `Password needs: ${missing.map((r) => r.label.toLowerCase()).join(", ")}.`;
  }
  return undefined;
}

export function validateBusinessName(name: string): string | undefined {
  const n = name.trim();
  if (!n) return "Enter your business name.";
  if (n.length < 2) return "Business name must be at least 2 characters.";
  if (n.length > 100) return "Business name must be 100 characters or fewer.";
  return undefined;
}

export function validateRegister(f: RegisterFields): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmail(f.email);
  const password = validatePassword(f.password);
  const businessName = validateBusinessName(f.businessName);
  if (email) errors.email = email;
  if (password) errors.password = password;
  if (businessName) errors.businessName = businessName;
  return errors;
}