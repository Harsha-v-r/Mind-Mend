import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify for robust sanitization
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'p', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Format suggestion text with markdown-like syntax and sanitize
 */
export function formatSuggestions(text: string): string {
  // Remove any code blocks first
  let formatted = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '');
  
  // Replace **bold** with <strong>bold</strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert line breaks to <br> tags
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Sanitize the final HTML
  return sanitizeHtml(formatted);
}
