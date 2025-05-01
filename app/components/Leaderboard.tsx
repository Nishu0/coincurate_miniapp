import { useState, useEffect } from 'react';
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity';
import { getTopContent, getTopCurators } from '../services/feedService';

export type LeaderboardType = 'content' | 'curators';

interface LeaderboardProps {
  type: LeaderboardType;
}

export function Leaderboard({ type }: LeaderboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [curators, setCurators] = useState<{ address: `0x${string}`; boostCount: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (type === 'content') {
          const topContent = await getTopContent();
          setContentItems(topContent);
        } else {
          const topCurators = await getTopCurators();
          setCurators(topCurators);
        }
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--app-accent)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-[var(--app-foreground-muted)]">
        {error}
      </div>
    );
  }

  if (type === 'content' && contentItems.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--app-foreground-muted)]">
        No curated content found
      </div>
    );
  }

  if (type === 'curators' && curators.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--app-foreground-muted)]">
        No curators found
      </div>
    );
  }

  return (
    <div className="bg-[var(--app-background)] rounded-lg p-4 border border-[var(--app-gray)]">
      <h3 className="text-lg font-semibold mb-4">
        {type === 'content' ? 'Top Curated Content' : 'Top Curators'}
      </h3>
      
      {type === 'content' ? (
        <div className="space-y-4">
          {contentItems.map((item, index) => (
            <div key={item.id} className="flex items-start py-2 border-b border-[var(--app-gray)] last:border-0">
              <div className="flex-shrink-0 mr-3 font-semibold text-lg text-[var(--app-foreground-muted)]">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <Identity address={item.author.address}>
                    <Avatar className="w-5 h-5 mr-1" />
                    <Name className="text-sm font-medium" />
                  </Identity>
                </div>
                <p className="text-sm line-clamp-2 mb-1">{item.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-[var(--app-gray)] px-2 py-1 rounded">
                    {item.coinName} ({item.coinSymbol})
                  </span>
                  <span className="text-xs text-[var(--app-foreground-muted)]">
                    {item.boostCount} boosts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {curators.map((curator, index) => (
            <div key={curator.address} className="flex items-center py-2 border-b border-[var(--app-gray)] last:border-0">
              <div className="flex-shrink-0 mr-3 font-semibold text-lg text-[var(--app-foreground-muted)]">
                #{index + 1}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <Identity address={curator.address}>
                  <div className="flex items-center">
                    <Avatar className="w-6 h-6 mr-2" />
                    <Name className="font-medium" />
                  </div>
                </Identity>
                <span className="text-sm text-[var(--app-foreground-muted)]">
                  {curator.boostCount} boosts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 