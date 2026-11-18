/**
 * react-colorful's stylesheet, which it adds as a <style> tag: allowed by its
 * exact contents, so no other inline style can apply. contentSecurityPolicy.test
 * fails with the new hash if an upgrade changes it.
 */
export const REACT_COLORFUL_STYLE_HASH =
  "'sha256-I2px+fnpbN4E5+Djrj7aoTIyq9yyREkuVl19f4Sye9A='"

/*
 * Only scripts bundled with the app may run, and no network requests are
 * allowed, so injected content can't read or send the journal anywhere.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  `style-src 'self' ${REACT_COLORFUL_STYLE_HASH}`,
  "font-src 'self'",
  // blob: is the background picture or video, read from this browser's own storage.
  "img-src 'self' data: blob:",
  'media-src blob:',
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "object-src 'none'",
].join('; ')
