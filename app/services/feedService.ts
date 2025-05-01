// This is a mock feed for the initial version
// In a real app, we would fetch this from the Farcaster API
interface FeedItem {
  id: string;
  author: {
    fid: number;
    address: `0x${string}`;
  };
  content: string;
  timestamp: number;
  coinName: string;
  coinSymbol: string;
  coinAddress: `0x${string}`;
  boostCount: number;
}

// Mock data for development
const MOCK_FEED: FeedItem[] = [
  {
    id: '1',
    author: {
      fid: 12345,
      address: '0x1234567890123456789012345678901234567890',
    },
    content: 'Just launched a new NFT collection! Check it out on Zora.',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    coinName: 'Collection Token',
    coinSymbol: 'CLT',
    coinAddress: '0x2345678901234567890123456789012345678901',
    boostCount: 8,
  },
  {
    id: '2',
    author: {
      fid: 23456,
      address: '0x3456789012345678901234567890123456789012',
    },
    content: 'New music drop on Sound.xyz - limited edition tokens available!',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    coinName: 'Sound Token',
    coinSymbol: 'SND',
    coinAddress: '0x4567890123456789012345678901234567890123',
    boostCount: 12,
  },
  {
    id: '3',
    author: {
      fid: 34567,
      address: '0x5678901234567890123456789012345678901234',
    },
    content: 'Building a new DeFi protocol - early supporters get governance tokens!',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    coinName: 'Protocol DAO',
    coinSymbol: 'PDAO',
    coinAddress: '0x6789012345678901234567890123456789012345',
    boostCount: 5,
  },
  {
    id: '4',
    author: {
      fid: 45678,
      address: '0x7890123456789012345678901234567890123456',
    },
    content: 'My thoughts on the future of social tokens and creator economies...',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
    coinName: 'Creator Token',
    coinSymbol: 'CREATE',
    coinAddress: '0x8901234567890123456789012345678901234567',
    boostCount: 15,
  },
];

// For simplicity, we're keeping the boosted items in memory
// In a real app, this would be stored in a database
const boostedItems = new Map<string, Set<string>>();

/**
 * Fetch feed data
 */
export async function fetchFeed(): Promise<FeedItem[]> {
  // In a real app, this would fetch from Farcaster API
  // For MVP, we'll use mock data
  return Promise.resolve([...MOCK_FEED]);
}

/**
 * Check if a user owns a specific content coin
 */
export async function checkCoinOwnership(
  userAddress: `0x${string}`,
  coinAddress: `0x${string}`
): Promise<boolean> {
  try {
    // In a real app, this would check the user's token balance using wagmi/viem
    // For MVP, we'll simulate ownership for certain addresses
    
    // Mock implementation - in a real app you'd query token balances
    // For testing, any address ending with '1' or '3' will be considered as owning the coin
    const lastChar = userAddress.slice(-1);
    return lastChar === '1' || lastChar === '3';
  } catch (error) {
    console.error('Error checking coin ownership:', error);
    return false;
  }
}

/**
 * Boost a piece of content
 */
export async function boostContent(contentId: string): Promise<boolean> {
  try {
    // In a real app, this might:
    // 1. Make a contract call to stake/lock tokens
    // 2. Record the boost in a database
    // 3. Potentially emit an event
    
    // For MVP, we'll just keep track in memory
    // Simulate a delay for UX purposes
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find the content and update its boost count
    const content = MOCK_FEED.find(item => item.id === contentId);
    if (content) {
      content.boostCount += 1;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error boosting content:', error);
    throw new Error('Failed to boost content');
  }
}

/**
 * Get top curators (users who have boosted the most content)
 */
export async function getTopCurators(): Promise<{ address: `0x${string}`; boostCount: number }[]> {
  // This would normally fetch from a database
  // For MVP, we'll return mock data
  return [
    { address: '0x1234567890123456789012345678901234567890', boostCount: 24 },
    { address: '0x2345678901234567890123456789012345678901', boostCount: 18 },
    { address: '0x3456789012345678901234567890123456789012', boostCount: 15 },
  ];
}

/**
 * Get top curated content (content with the most boosts)
 */
export async function getTopContent(): Promise<FeedItem[]> {
  const feed = await fetchFeed();
  return [...feed].sort((a, b) => b.boostCount - a.boostCount).slice(0, 5);
} 