/**
 * Sanitizes error messages to remove technical service names
 * that might confuse or worry users
 */
export const sanitizeErrorMessage = (error: string | Error): string => {
  const errorText = typeof error === 'string' ? error : error.message;
  
  return errorText
    // Replace Supabase references
    .replace(/supabase/gi, 'server')
    .replace(/wutyryaqlmgsbllnyoop/g, 'system')
    .replace(/\b[a-z]{20}\.supabase\.co\b/gi, 'secure server')
    // Replace database references
    .replace(/postgres/gi, 'database')
    .replace(/postgresql/gi, 'database')
    // Replace generic technical terms
    .replace(/\bRPC\b/g, 'service')
    .replace(/\bAPI\b/g, 'service')
    // Keep the message readable
    .replace(/server server/gi, 'server')
    .replace(/database database/gi, 'database');
};

/**
 * Sanitizes error objects for user display
 */
export const sanitizeError = (error: unknown): string => {
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }
  if (typeof error === 'string') {
    return sanitizeErrorMessage(error);
  }
  return 'An unexpected error occurred. Please try again.';
};
