import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useOpenUrl } from '@coinbase/onchainkit/minikit';
import { fetchCommunityMetrics, fetchPremiumMetrics, trackAffiliateClick, CommunityMetrics, PremiumMetrics } from '../services/communityService';

// Simple button component
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

function Button({ 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  className = '',
  children 
}: ButtonProps) {
  const baseClasses = 'font-medium transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white',
    secondary: 'bg-[var(--app-gray)] hover:bg-[var(--app-gray-hover)] text-[var(--app-foreground)]'
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}

// Icon component
interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

function Icon({ name, size = 24, className = '' }: IconProps) {
  // A simple function to map icon names to SVG paths
  const getIconPath = (iconName: string) => {
    switch (iconName) {
      case 'info':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return getIconPath(name);
}

export function CommunityFinder() {
  const [communities, setCommunities] = useState<CommunityMetrics[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<string | null>(null);
  const [premiumMetrics, setPremiumMetrics] = useState<PremiumMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [sortBy, setSortBy] = useState<'volume' | 'growth' | 'score'>('volume');
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { address, isConnected } = useAccount();
  const openUrl = useOpenUrl();

  // Function to load communities
  const loadCommunities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchCommunityMetrics(20, sortBy, isPremiumUser);
      setCommunities(data);
      
      if (data.length === 0) {
        setError('No coin communities found. Try again later when there are more crypto discussions.');
      }
    } catch (err) {
      console.error('Failed to load communities', err);
      setError('Failed to load community data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load communities on initial render and when sort changes
  useEffect(() => {
    loadCommunities();
  }, [sortBy, isPremiumUser]);

  // Load premium metrics when a coin is selected
  useEffect(() => {
    if (selectedCoin) {
      const loadPremiumMetrics = async () => {
        try {
          const metrics = await fetchPremiumMetrics(selectedCoin);
          setPremiumMetrics(metrics);
        } catch (err) {
          console.error('Failed to load premium metrics', err);
        }
      };
      
      loadPremiumMetrics();
    } else {
      setPremiumMetrics(null);
    }
  }, [selectedCoin]);

  // Handle buying a coin
  const handleBuy = (coinSymbol: string, coinAddress: `0x${string}`, coinChain: string) => {
    // Generate affiliate referral code
    const referral = trackAffiliateClick(coinSymbol, 'zora');
    
    // Default to 'base' chain if no chain is specified
    const chain = coinChain || 'base';
    
    // Open Zora with our referral code using the correct chain and address
    const zoraUrl = `https://zora.co/coin/${chain}:${coinAddress.toLowerCase()}?ref=${referral}`;
    openUrl(zoraUrl);
  };

  // Handle upgrading to premium
  const handleUpgrade = () => {
    if (!isConnected) {
      // Show "connect wallet first" message
      setError('Please connect your wallet to upgrade to premium.');
      return;
    }
    
    // In a real app, this would show a payment modal
    // For now, we'll just set the user as premium
    setShowUpgradeModal(true);
  };

  // Confirm premium upgrade
  const confirmUpgrade = () => {
    setIsPremiumUser(true);
    setShowUpgradeModal(false);
  };

  // Get a community health indicator color based on score
  const getHealthColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Format growth rate with + or - sign
  const formatGrowthRate = (rate: number) => {
    if (rate < 0) return `${rate.toFixed(1)}%`;
    return `+${rate.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8 text-center text-[var(--app-foreground-muted)]">
        <div>
          <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>{error}</p>
          <button 
            className="mt-3 px-4 py-1 text-xs font-medium bg-[var(--app-accent)] text-white rounded-full"
            onClick={loadCommunities}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header and sorting options */}
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Coin Communities
          </h2>
          <p className="text-xs text-[var(--app-foreground-muted)]">Find the most engaged community coins</p>
        </div>
        
        <div>
          {!isPremiumUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpgrade}
              className="rounded-full mr-2 bg-gradient-to-r from-purple-500 to-indigo-500"
            >
              <span className="flex items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upgrade
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Sorting tabs */}
      <div className="flex border border-[var(--app-gray)] rounded-full overflow-hidden mb-4">
        <button
          onClick={() => setSortBy('volume')}
          className={`px-3 py-1 text-xs font-medium flex-1 ${
            sortBy === 'volume'
              ? 'bg-[var(--app-accent)] text-white'
              : 'text-[var(--app-foreground-muted)]'
          }`}
        >
          Most Active
        </button>
        <button
          onClick={() => setSortBy('growth')}
          className={`px-3 py-1 text-xs font-medium flex-1 ${
            sortBy === 'growth'
              ? 'bg-[var(--app-accent)] text-white'
              : 'text-[var(--app-foreground-muted)]'
          }`}
        >
          Fastest Growing
        </button>
        <button
          onClick={() => setSortBy('score')}
          className={`px-3 py-1 text-xs font-medium flex-1 ${
            sortBy === 'score'
              ? 'bg-[var(--app-accent)] text-white'
              : 'text-[var(--app-foreground-muted)]'
          }`}
        >
          Healthiest
        </button>
      </div>

      {/* Info banner about data confidence */}
      {communities.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-xs">
          <div className="flex items-start">
            <svg className="w-4 h-4 mt-0.5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-[var(--app-foreground)]">
              <span className="font-semibold">Analysis Mode:</span> Showing coins detected in Farcaster posts with variable confidence. Some might be traditional tokens, while others are potential content coins based on trending discussions.
            </p>
          </div>
        </div>
      )}

      {/* Selected coin details */}
      {selectedCoin && premiumMetrics && (
        <div className="bg-[var(--app-gray-hover)] p-4 rounded-lg mb-4 border border-[var(--app-gray)]">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold">${premiumMetrics.coinSymbol}</h3>
              <p className="text-sm text-[var(--app-foreground-muted)]">{premiumMetrics.coinName}</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedCoin(null)}
              className="rounded-full"
            >
              <span className="flex items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[var(--app-gray)] p-3 rounded-lg">
              <p className="text-xs text-[var(--app-foreground-muted)]">Community Score</p>
              <p className={`text-xl font-bold ${getHealthColor(premiumMetrics.communityScore)}`}>
                {premiumMetrics.communityScore}/100
              </p>
            </div>
            <div className="bg-[var(--app-gray)] p-3 rounded-lg">
              <p className="text-xs text-[var(--app-foreground-muted)]">Discussion Volume</p>
              <p className="text-xl font-bold">{premiumMetrics.discussionVolume} mentions</p>
            </div>
            <div className="bg-[var(--app-gray)] p-3 rounded-lg">
              <p className="text-xs text-[var(--app-foreground-muted)]">Weekly Growth</p>
              <p className={`text-xl font-bold ${premiumMetrics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatGrowthRate(premiumMetrics.growthRate)}
              </p>
            </div>
            <div className="bg-[var(--app-gray)] p-3 rounded-lg">
              <p className="text-xs text-[var(--app-foreground-muted)]">Active Members</p>
              <p className="text-xl font-bold">{premiumMetrics.uniqueParticipants}</p>
            </div>
          </div>

          {isPremiumUser && (
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-3 rounded-lg mb-4 border border-purple-500/30">
              <h4 className="font-semibold text-sm mb-2 flex items-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 text-purple-400">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Premium Insights
              </h4>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <p className="text-xs text-[var(--app-foreground-muted)]">Sentiment Score</p>
                  <p className={`text-sm font-semibold ${premiumMetrics.sentimentScore > 50 ? 'text-green-500' : 'text-red-500'}`}>
                    {premiumMetrics.sentimentScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--app-foreground-muted)]">Avg Hold Time</p>
                  <p className="text-sm font-semibold">
                    {premiumMetrics.averageHoldTime} days
                  </p>
                </div>
              </div>

              <div className="bg-[var(--app-gray)] p-2 rounded-lg text-xs">
                <p className="font-semibold mb-1">Whale Activity:</p>
                <p className="text-[var(--app-foreground-muted)]">{premiumMetrics.whaleActivity}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBuy(premiumMetrics.coinSymbol, premiumMetrics.coinAddress, premiumMetrics.coinChain)}
              className="rounded-full flex-1"
            >
              <span className="flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                  <path d="M20 12V8H6a2 2 0 01-2-2 2 2 0 012-2h12v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 12v4H6a2 2 0 00-2 2 2 2 0 002 2h12v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Buy on Zora
              </span>
            </Button>
            {!isPremiumUser && premiumMetrics.isPremiumInsight && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUpgrade}
                className="rounded-full"
              >
                <span className="flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1.5">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Unlock Premium
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Communities list */}
      <div className="space-y-2">
        {communities.map((community) => (
          <div 
            key={community.coinSymbol} 
            className={`border border-[var(--app-gray)] rounded-lg p-3 flex items-center justify-between hover:border-[var(--app-accent)] transition-all duration-200 cursor-pointer ${
              community.isPremiumInsight && !isPremiumUser ? 'bg-gradient-to-r from-purple-900/5 to-indigo-900/5' : ''
            }`}
            onClick={() => setSelectedCoin(community.coinSymbol)}
            onDoubleClick={() => handleBuy(community.coinSymbol, community.coinAddress, community.coinChain)}
          >
            <div className="flex items-center">
              <div className="bg-[var(--app-gray)] h-10 w-10 rounded-full flex items-center justify-center mr-3 font-bold text-lg">
                {community.coinSymbol.charAt(0)}
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-semibold">${community.coinSymbol}</h3>
                  {community.isPremiumInsight && !isPremiumUser && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 text-purple-400">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center text-xs text-[var(--app-foreground-muted)]">
                  <span>{community.discussionVolume} mentions</span>
                  <span className="mx-1">•</span>
                  <span>{community.uniqueParticipants} participants</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className={`flex items-center ${getHealthColor(community.communityScore)}`}>
                <span className="font-semibold">{community.communityScore}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
                  <path d="M12 17V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {community.growthRate >= 0 ? (
                <span className="text-xs text-green-500">{formatGrowthRate(community.growthRate)}</span>
              ) : (
                <span className="text-xs text-red-500">{formatGrowthRate(community.growthRate)}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Premium upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-[var(--app-background)] p-6 rounded-xl w-4/5 max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Upgrade to Premium</h3>
              <button 
                className="text-[var(--app-foreground-muted)]"
                onClick={() => setShowUpgradeModal(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 p-4 rounded-lg mb-4 border border-purple-500/30">
              <h4 className="font-semibold mb-2 flex items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 text-purple-400">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Premium Features
              </h4>
              
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 text-green-500">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Advanced community health metrics</span>
                </li>
                <li className="flex items-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 text-green-500">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Whale activity tracking and alerts</span>
                </li>
                <li className="flex items-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 text-green-500">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Sentiment analysis for all communities</span>
                </li>
                <li className="flex items-start">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 mt-0.5 text-green-500">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Early access to new content coins</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Monthly Subscription</span>
                <span className="font-bold">0.01 ETH</span>
              </div>
              <p className="text-xs text-[var(--app-foreground-muted)] mb-4">Cancel anytime. Subscription renews automatically.</p>
              
              {/* Demo disclaimer */}
              <div className="bg-yellow-500/10 p-2 rounded-md text-xs border border-yellow-500/30 text-yellow-500">
                <p><span className="font-bold">DEMO:</span> No real payment will be processed. This is a demonstration only.</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={confirmUpgrade}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 