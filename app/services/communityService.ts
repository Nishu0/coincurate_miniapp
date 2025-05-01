import { getNeynarApiKey } from './apiSetup';

// Interface for community metrics
export interface CommunityMetrics {
  coinSymbol: string;
  coinName: string;
  coinAddress: `0x${string}`;
  coinChain: string; // Chain identifier (base, ethereum, etc.)
  discussionVolume: number; // Number of mentions in the last 7 days
  uniqueParticipants: number; // Number of unique users discussing
  responseRate: number; // Average response time to questions (in hours)
  growthRate: number; // Week-over-week growth in discussion volume
  creatorActivity: number; // How often creators/team respond in discussions
  communityScore: number; // Aggregate health score (0-100)
  isPremiumInsight: boolean; // Whether this insight is premium-only
}

// Interface for premium metrics (expanded insights)
export interface PremiumMetrics extends CommunityMetrics {
  sentimentScore: number; // Positive vs negative sentiment (0-100)
  topContributors: string[]; // FIDs of most active community members
  averageHoldTime: number; // Average time users hold the coin before selling
  whaleActivity: string; // Description of large holder behavior
  priceCorrelation: number; // Correlation between discussion and price (-1 to 1)
}

// Affiliate tracking for monetization
interface AffiliateTracking {
  referralCode: string;
  clickCount: number;
  conversionCount: number;
  revenue: number;
}

// Store affiliate data
const affiliateData: Record<string, AffiliateTracking> = {};

// Helper function to extract Ethereum address from URL or text
function extractEthereumAddress(text: string): `0x${string}` | null {
  // Look for base:0x pattern which is used for Base chain addresses in Zora URLs
  const baseRegex = /base:((0x)[a-fA-F0-9]{40})/i;
  const baseMatch = text.match(baseRegex);
  if (baseMatch && baseMatch[1]) {
    return baseMatch[1].toLowerCase() as `0x${string}`;
  }
  
  // Standard Ethereum address regex
  const ethRegex = /(0x[a-fA-F0-9]{40})/i;
  const ethMatch = text.match(ethRegex);
  if (ethMatch && ethMatch[1]) {
    return ethMatch[1].toLowerCase() as `0x${string}`;
  }
  
  return null;
}

// Helper function to extract coin name/symbol from cast text
function extractCoinInfo(text: string): { name: string; symbol: string } | null {
  // Look for token symbols like $XYZ or ticker symbols
  const symbolRegex = /\$([A-Z0-9]{2,10})/i;
  const symbolMatch = text.match(symbolRegex);
  
  if (symbolMatch && symbolMatch[1]) {
    const symbol = symbolMatch[1].toUpperCase();
    // Generate a reasonable name from the symbol
    const name = symbol.length <= 4 
      ? `${symbol} Token`
      : symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase();
    
    return { name, symbol };
  }
  
  return null;
}

// Fetch community metrics for content coins
export async function fetchCommunityMetrics(
  limit = 20, 
  sortBy: 'volume' | 'growth' | 'score' = 'volume',
  isPremiumUser = false
): Promise<CommunityMetrics[]> {
  try {
    const neynarApiKey = getNeynarApiKey();
    
    console.log('🔍 Fetching trending content from Neynar API...');
    
    // Fetch trending content from Neynar API
    const response = await fetch(`https://api.neynar.com/v2/farcaster/feed?feed_type=filter&filter_type=global_trending&with_recasts=true&limit=50`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': neynarApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const casts = responseData.casts || [];
    
    console.log(`📊 Processing ${casts.length} posts from Farcaster...`);
    
    // Extract mentions of coins (look for $ symbols)
    const coinMentions: Record<string, {
      count: number,
      uniqueUsers: Set<number>,
      symbol: string,
      name: string,
      address?: `0x${string}`
    }> = {};
    
    // Map of channels that represent potential coins/tokens
    const channelToCoin: Record<string, { symbol: string, chain: string }> = {
      'base': { symbol: 'BASE', chain: 'base' },
      'monad': { symbol: 'MON', chain: 'ethereum' },
      'betr': { symbol: 'BETR', chain: 'base' },
      'yellow': { symbol: 'YELLOW', chain: 'base' },
      'optimism': { symbol: 'OP', chain: 'optimism' },
      'zora': { symbol: 'ZORA', chain: 'ethereum' },
      'arbitrum': { symbol: 'ARB', chain: 'arbitrum' }
    };
    
    // Projects/users that might be associated with coins
    const projectsToCoin: Record<string, { symbol: string, chain: string }> = {
      'warpcast': { symbol: 'CAST', chain: 'base' },
      'farcaster': { symbol: 'CAST', chain: 'base' },
      'base': { symbol: 'BASE', chain: 'base' },
      'monad': { symbol: 'MON', chain: 'ethereum' },
      'zora': { symbol: 'ZORA', chain: 'ethereum' },
      'betrmint': { symbol: 'BETR', chain: 'base' },
      'uno': { symbol: 'UNO', chain: 'base' },
      'bright moments': { symbol: 'BRIGHT', chain: 'ethereum' }
    };
    
    // Map for storing chain information for each coin
    const coinChains: Record<string, string> = {
      // Default chains for common coins
      'ETH': 'ethereum',
      'BTC': 'bitcoin',
      'BASE': 'base',
      'OP': 'optimism',
      'ARB': 'arbitrum',
      'ZORA': 'ethereum',
      'MON': 'ethereum',
      'BETR': 'base'
    };
    
    // Process casts to find coin mentions
    casts.forEach((cast: any) => {
      if (!cast.text) return;
      
      let foundSymbols: string[] = [];
      
      // Special case: Check for explicit mentions of specific coins in the text
      const explicitCoinMentions = [];
      
      // Check for BETR token which appears in one of the sample posts
      if (cast.text.toLowerCase().includes('$betr') || 
          cast.text.toLowerCase().includes(' betr token')) {
        explicitCoinMentions.push('BETR');
      }
      
      // Check for MON token which appears in the posts about Monad
      if (cast.text.toLowerCase().includes('mon token') || 
          cast.text.toLowerCase().includes('15000 mon') ||
          cast.text.toLowerCase().includes('10000 mon') ||
          cast.text.toLowerCase().includes('5000 mon') ||
          cast.text.toLowerCase().includes('2500 mon') ||
          cast.text.toLowerCase().includes('250 mon')) {
        explicitCoinMentions.push('MON');
      }
      
      // Check for project/user mentions in the text
      const lowerCaseText = cast.text.toLowerCase();
      for (const [project, coin] of Object.entries(projectsToCoin)) {
        if (lowerCaseText.includes(project.toLowerCase())) {
          explicitCoinMentions.push(coin.symbol);
          // Save chain info
          coinChains[coin.symbol] = coin.chain;
          console.log(`🏢 Found coin ${coin.symbol} from project mention: ${project}`);
          break;
        }
      }
      
      // Check for a channel association
      if (cast.channel && cast.channel.id) {
        const channelId = cast.channel.id.toLowerCase();
        if (channelToCoin[channelId]) {
          const associatedCoin = channelToCoin[channelId];
          explicitCoinMentions.push(associatedCoin.symbol);
          // Save chain info
          coinChains[associatedCoin.symbol] = associatedCoin.chain;
          console.log(`🔗 Found coin ${associatedCoin.symbol} from channel: ${cast.channel.name}`);
        }
      }
      
      // Process these explicit mentions first (highest confidence)
      explicitCoinMentions.forEach(symbol => {
        processSymbol(symbol, cast);
        foundSymbols.push(`[EXPLICIT] ${symbol}`);
      });
      
      // Look for coin symbols like $XYZ, #XYZ, or just XYZ if it looks like a coin symbol
      const dollarSymbolMatches = cast.text.match(/\$([A-Z0-9]{2,10})/gi);
      const hashtagMatches = cast.text.match(/#([A-Z0-9]{2,5})/gi);
      // Look for standalone tokens, including popular coins mentioned in the data
      const popularCoins = ['ETH', 'BTC', 'BETR', 'MON', 'BASE', 'DEGEN', 'NFT'];
      
      // Create a regex that prioritizes popular coin names
      const popularCoinsRegex = new RegExp(`\\b(${popularCoins.join('|')})\\b`, 'gi');
      const popularCoinMatches = cast.text.match(popularCoinsRegex);
      
      // General standalone uppercase tokens that might be coins
      const standaloneCoinMatches = cast.text.match(/\b([A-Z]{2,5})\b/g);
      
      // Process dollar symbol matches (highest confidence)
      if (dollarSymbolMatches) {
        dollarSymbolMatches.forEach((match: string) => {
          const symbol = match.substring(1).toUpperCase(); // Remove $ symbol and ensure uppercase
          processSymbol(symbol, cast);
          foundSymbols.push(`$${symbol}`);
        });
      }
      
      // Process hashtag matches (medium confidence)
      if (hashtagMatches) {
        hashtagMatches.forEach((match: string) => {
          const symbol = match.substring(1).toUpperCase(); // Remove # and ensure uppercase
          // Skip if already added via $ symbol
          if (!coinMentions[symbol]) {
            processSymbol(symbol, cast);
            foundSymbols.push(`#${symbol}`);
          }
        });
      }
      
      // Process popular coin matches (medium confidence)
      if (popularCoinMatches) {
        popularCoinMatches.forEach((match: string) => {
          const symbol = match.toUpperCase();
          // Skip if already added or if it's a common word
          if (!coinMentions[symbol] && !popularCoins.includes(symbol)) {
            processSymbol(symbol, cast);
            foundSymbols.push(symbol);
          }
        });
      }
      
      // Process standalone coin matches (lower confidence, more false positives)
      if (standaloneCoinMatches) {
        const commonWords = ['THE', 'AND', 'FOR', 'WITH', 'THIS', 'THAT', 'HAVE', 'FROM'];
        standaloneCoinMatches.forEach((match: string) => {
          const symbol = match.toUpperCase();
          // Skip if already added or if it's a common word
          if (!coinMentions[symbol] && !commonWords.includes(symbol)) {
            // Keywords that might indicate crypto discussion
            const cryptoKeywords = ['coin', 'token', 'crypto', 'blockchain', 'defi', 'nft', 'dao', 'holders'];
            const mentionedWithCryptoContext = cryptoKeywords.some(keyword => 
              cast.text.toLowerCase().includes(keyword)
            );
            
            if (mentionedWithCryptoContext) {
              processSymbol(symbol, cast);
              foundSymbols.push(symbol);
            }
          }
        });
      }
      
      if (foundSymbols.length > 0) {
        const author = cast.author?.username || cast.author?.fid || 'unknown';
        console.log(`🪙 Found symbols in post from @${author}: ${foundSymbols.join(', ')}`);
        console.log(`  Text snippet: "${cast.text.substring(0, 50)}${cast.text.length > 50 ? '...' : ''}"`);
      }
      
      // Helper function to process a symbol
      function processSymbol(symbol: string, cast: any) {
        if (!coinMentions[symbol]) {
          coinMentions[symbol] = {
            count: 0,
            uniqueUsers: new Set(),
            symbol,
            name: symbol.length <= 4 ? `${symbol} Token` : symbol.charAt(0).toUpperCase() + symbol.slice(1).toLowerCase(),
            address: undefined
          };
        }
        
        coinMentions[symbol].count++;
        coinMentions[symbol].uniqueUsers.add(cast.author.fid);
        
        // Extract address if it exists in embed
        if (cast.embeds && cast.embeds.length > 0) {
          for (const embed of cast.embeds) {
            const urlMatch = embed.url?.match(/0x[a-fA-F0-9]{40}/);
            if (urlMatch) {
              coinMentions[symbol].address = urlMatch[0] as `0x${string}`;
              console.log(`  📝 Found address for ${symbol}: ${urlMatch[0]}`);
              break;
            }
          }
        }
      }
    });
    
    // Transform the data into community metrics
    const metrics: CommunityMetrics[] = Object.values(coinMentions)
      .filter(coin => coin.count >= 1) // Show coins with any mentions
      .map(coin => {
        // Generate metrics based on real data
        const discussionVolume = coin.count;
        const uniqueParticipants = coin.uniqueUsers.size;
        const responseRate = Math.random() * 24; // 0-24 hours (simulated)
        const growthRate = Math.random() * 100 - 20; // -20% to +80% (simulated)
        const creatorActivity = Math.random() * 10; // 0-10 scale (simulated)
        
        // Calculate overall community score (0-100)
        const volumeScore = Math.min(100, discussionVolume * 2);
        const participantScore = Math.min(100, uniqueParticipants * 5);
        const responseScore = Math.max(0, 100 - (responseRate * 4));
        const growthScore = Math.min(100, Math.max(0, growthRate + 50));
        const activityScore = creatorActivity * 10;
        
        const communityScore = Math.round(
          (volumeScore * 0.25) + 
          (participantScore * 0.25) + 
          (responseScore * 0.2) + 
          (growthScore * 0.15) + 
          (activityScore * 0.15)
        );
        
        // Mark high-scoring insights as premium
        const isPremiumInsight = communityScore > 75;
        
        // Create placeholder address if none was found
        const coinAddress = coin.address || 
          `0x${coin.symbol.padEnd(40, '0').substring(0, 40)}` as `0x${string}`;
        
        return {
          coinSymbol: coin.symbol,
          coinName: coin.name,
          coinAddress,
          coinChain: coinChains[coin.symbol] || 'ethereum',
          discussionVolume,
          uniqueParticipants,
          responseRate: isPremiumUser || !isPremiumInsight ? responseRate : -1,
          growthRate: isPremiumUser || !isPremiumInsight ? growthRate : -1,
          creatorActivity: isPremiumUser || !isPremiumInsight ? creatorActivity : -1,
          communityScore,
          isPremiumInsight
        };
      });
    
    // Sort the metrics based on the sortBy parameter
    if (sortBy === 'volume') {
      metrics.sort((a, b) => b.discussionVolume - a.discussionVolume);
    } else if (sortBy === 'growth') {
      metrics.sort((a, b) => b.growthRate - a.growthRate);
    } else if (sortBy === 'score') {
      metrics.sort((a, b) => b.communityScore - a.communityScore);
    }
    
    console.log(`💰 Found ${metrics.length} coins in trending posts:`);
    metrics.forEach((coin, index) => {
      console.log(`  ${index + 1}. ${coin.coinSymbol} - ${coin.discussionVolume} mentions, ${coin.uniqueParticipants} participants, score: ${coin.communityScore}`);
    });
    
    // If no coins found, log warning
    if (metrics.length === 0) {
      console.warn("⚠️ No coin mentions found in trending posts");
    }
    
    return metrics.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching community metrics:', error);
    throw error;
  }
}

// For premium users, get enhanced metrics
export async function fetchPremiumMetrics(coinSymbol: string): Promise<PremiumMetrics | null> {
  try {
    // Fetch basic metrics first
    const allMetrics = await fetchCommunityMetrics(100, 'score', true);
    const basicMetrics = allMetrics.find(m => m.coinSymbol === coinSymbol);
    
    if (!basicMetrics) {
      return null;
    }
    
    // Add premium metrics - some values still simulated since we don't have real data for them
    return {
      ...basicMetrics,
      sentimentScore: Math.round(Math.random() * 100),
      topContributors: [
        'user1', 'user2', 'user3', 'user4', 'user5'
      ],
      averageHoldTime: Math.round(Math.random() * 90), // 0-90 days
      whaleActivity: getRandomWhaleActivity(),
      priceCorrelation: (Math.random() * 2 - 1) // -1 to 1
    };
  } catch (error) {
    console.error('Error fetching premium metrics:', error);
    return null;
  }
}

// Track an affiliate link click
export function trackAffiliateClick(coinSymbol: string, exchange: string): string {
  const referralCode = `REF-${coinSymbol}-${exchange}-${Date.now().toString(36)}`;
  
  affiliateData[referralCode] = {
    referralCode,
    clickCount: 1,
    conversionCount: 0,
    revenue: 0
  };
  
  return referralCode;
}

// Record a conversion (for admin use)
export function recordConversion(referralCode: string, amount: number): boolean {
  if (!affiliateData[referralCode]) {
    return false;
  }
  
  // Assume 5% commission on trades
  const commission = amount * 0.05;
  
  affiliateData[referralCode].conversionCount += 1;
  affiliateData[referralCode].revenue += commission;
  
  return true;
}

// Get affiliate data for reporting
export function getAffiliateStats(): AffiliateTracking[] {
  return Object.values(affiliateData);
}

// Helper function to generate random whale activity descriptions
function getRandomWhaleActivity(): string {
  const activities = [
    "Whales accumulating steadily over past 7 days",
    "One major whale sold 25% of holdings yesterday",
    "New whale address appeared, acquired 5% of supply",
    "Whales mostly holding, minimal movement",
    "Several mid-sized holders upgraded to whale status"
  ];
  
  return activities[Math.floor(Math.random() * activities.length)];
}

// Get top curators based on boost activity with pagination
export async function getTopCurators(page = 1, pageSize = 4): Promise<{ curators: { address: `0x${string}`; username: string; pfp: string; boostCount: number }[], hasMore: boolean }> {
  try {
    const neynarApiKey = getNeynarApiKey();
    
    // Get popular users by directly using the API
    const popularFids = [2, 3, 602, 1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const skip = (page - 1) * pageSize;
    const fidsToFetch = popularFids.slice(skip, skip + pageSize + 1); // +1 to check for hasMore
    
    // Only proceed if we have fids to fetch
    if (fidsToFetch.length === 0) {
      return { curators: [], hasMore: false };
    }
    
    // Call Neynar API to get user data
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fidsToFetch.join(',')}`, {
      headers: {
        'accept': 'application/json',
        'x-api-key': neynarApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const responseData = await response.json();
    const users = responseData.users || [];
    
    // Transform the data into curators format
    const curators = users.map((user: any) => {
      // Generate a random boost count for demonstration
      const boostCount = Math.floor(Math.random() * 100) + 20;
      
      return {
        address: user.custody_address as `0x${string}`,
        username: user.username || `user_${user.fid}`,
        pfp: user.pfp_url || '',
        boostCount
      };
    });
    
    // Check if there are more items
    const hasMore = curators.length > pageSize;
    
    // Slice to requested pageSize
    const paginatedCurators = curators.slice(0, pageSize);
    
    return {
      curators: paginatedCurators,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching top curators:', error);
    throw error;
  }
} 