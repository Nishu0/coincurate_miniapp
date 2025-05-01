/**
 * API key setup for Neynar and other services
 */

/**
 * Helper function to get the Neynar API key
 * If no key is provided in the environment, it returns instructions
 */
export function getNeynarApiKey(): string {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_NEYNAR_API_KEY && 
      process.env.NEXT_PUBLIC_NEYNAR_API_KEY !== 'YOUR_NEYNAR_API_KEY_HERE') {
    return process.env.NEXT_PUBLIC_NEYNAR_API_KEY;
  }
  
  // For demo purposes, temporarily use a hard-coded API key (REPLACE WITH YOUR ACTUAL KEY)
  // Get your API key from: https://dev.neynar.com/
  console.warn('⚠️ No valid Neynar API key found. Using mock data instead of real API calls.');
  console.warn('To use real data: Get an API key from https://dev.neynar.com/ and add it to .env.local file as NEXT_PUBLIC_NEYNAR_API_KEY=your_key_here');
  
  return "";  // Return empty string to trigger fallback to mock data
}