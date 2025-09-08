export interface PasswordStrength {
  isValid: boolean;
  score: number; // 0-4 (4 being strongest)
  feedback: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Minimum length check
  if (password.length < 12) {
    feedback.push("Password must be at least 12 characters long");
  } else {
    score += 1;
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Password must contain at least one uppercase letter");
  } else {
    score += 1;
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    feedback.push("Password must contain at least one lowercase letter");
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push("Password must contain at least one number");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push("Password must contain at least one special character");
  } else {
    score += 1;
  }

  // Common password patterns (basic check)
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push("Password contains common patterns - please choose a more unique password");
    score = Math.max(0, score - 1);
  }

  const isValid = feedback.length === 0 && password.length >= 12;

  return {
    isValid,
    score: Math.min(4, score),
    feedback
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "Weak";
    case 2:
      return "Fair";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    default:
      return "Weak";
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "text-red-600";
    case 2:
      return "text-yellow-600";
    case 3:
      return "text-blue-600";
    case 4:
      return "text-green-600";
    default:
      return "text-red-600";
  }
}