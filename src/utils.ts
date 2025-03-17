/**
 * Generates a unique message ID
 * @returns A unique message ID
 */
function generateMessageId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export { generateMessageId };
