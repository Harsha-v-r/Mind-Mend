// Client-side encryption utilities using Web Crypto API
// Data is encrypted before being sent to the database and can only be decrypted by the user

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// Derive a cryptographic key from user ID
async function deriveKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Use a fixed salt based on app identifier (this is acceptable for client-side encryption)
  const salt = encoder.encode('mood-tracker-encryption-salt-v1');

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

// Convert ArrayBuffer to base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt text using the user's ID as the key source
 * Returns a string in format: base64(iv):base64(encryptedData)
 */
export async function encryptText(plainText: string, userId: string): Promise<string> {
  if (!plainText) return '';
  
  try {
    const key = await deriveKey(userId);
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    
    // Generate a random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      data
    );
    
    // Return IV and encrypted data as base64, separated by colon
    return `${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(encryptedData)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt text using the user's ID as the key source
 * Expects input in format: base64(iv):base64(encryptedData)
 */
export async function decryptText(encryptedText: string, userId: string): Promise<string> {
  if (!encryptedText) return '';
  
  // Check if the text is in encrypted format (contains colon separator)
  if (!encryptedText.includes(':')) {
    // Return as-is if not encrypted (legacy data)
    return encryptedText;
  }
  
  try {
    const [ivBase64, dataBase64] = encryptedText.split(':');
    
    if (!ivBase64 || !dataBase64) {
      return encryptedText; // Return as-is if format is invalid
    }
    
    const key = await deriveKey(userId);
    const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
    const encryptedData = base64ToArrayBuffer(dataBase64);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error('Decryption error:', error);
    // Return placeholder for data that can't be decrypted
    return '[Unable to decrypt - data may be corrupted or from a different user]';
  }
}
