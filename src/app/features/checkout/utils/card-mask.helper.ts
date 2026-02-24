/**
 * Masks a card number to show only the last 4 digits
 * @param cardNumber - The card number to mask (can include spaces)
 * @returns Masked card number in format: •••• •••• •••• 1234
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length !== 16) return cardNumber;

  const lastFour = cleaned.slice(-4);
  return `•••• •••• •••• ${lastFour}`;
}

/**
 * Formats a card number by adding spaces every 4 digits
 * @param value - The card number to format
 * @returns Formatted card number with spaces: 1234 5678 9012 3456
 */
export function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}
