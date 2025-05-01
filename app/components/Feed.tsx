import { useState, useEffect } from 'react';
import { FeedItem } from './FeedItem';
import { useAccount } from 'wagmi';
import { fetchFeed, boostContent, checkCoinOwnership } from '../services/feedService';

export type FeedSortOption = 'recent' | 'popular';

interface FeedProps {
  sortBy: FeedSortOption;
}

export function Feed({ sortBy }: FeedProps) {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    const loadFeed = async () => {
      setIsLoading(true);
      try {
        const items = await fetchFeed();
        // Sort items based on the selected option
        const sortedItems = sortBy === 'popular' 
          ? [...items].sort((a, b) => b.boostCount - a.boostCount)
          : [...items].sort((a, b) => b.timestamp - a.timestamp);
        
        // Check if user owns the respective coins
        if (address) {
          const itemsWithOwnership = await Promise.all(
            sortedItems.map(async (item) => {
              const canBoost = await checkCoinOwnership(address, item.coinAddress);
              return { ...item, canBoost };
            })
          );
          setFeedItems(itemsWithOwnership);
        } else {
          setFeedItems(sortedItems.map(item => ({ ...item, canBoost: false })));
        }
      } catch (err) {
        setError('Failed to load feed. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, [sortBy, address]);

  const handleBoost = async (id: string) => {
    try {
      await boostContent(id);
      
      // Update local state
      setFeedItems(items => 
        items.map(item => 
          item.id === id 
            ? { ...item, boostCount: item.boostCount + 1 }
            : item
        )
      );
    } catch (err) {
      console.error('Failed to boost content:', err);
      // Could add toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-[var(--app-foreground-muted)]">
        {error}
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--app-foreground-muted)]">
        No content found. Try again later.
      </div>
    );
  }

  return (
    <div>
      {feedItems.map(item => (
        <FeedItem
          key={item.id}
          id={item.id}
          author={item.author}
          content={item.content}
          timestamp={item.timestamp}
          coinName={item.coinName}
          coinSymbol={item.coinSymbol}
          coinAddress={item.coinAddress}
          boostCount={item.boostCount}
          canBoost={item.canBoost}
          onBoost={handleBoost}
        />
      ))}
    </div>
  );
} 