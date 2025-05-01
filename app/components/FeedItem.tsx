import { useState } from 'react';
import { Button } from './DemoComponents';
import { Identity, Avatar, Name } from '@coinbase/onchainkit/identity';

interface FeedItemProps {
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
  canBoost: boolean;
  onBoost: (id: string) => void;
}

export function FeedItem({
  id,
  author,
  content,
  timestamp,
  coinName,
  coinSymbol,
  coinAddress,
  boostCount,
  canBoost,
  onBoost,
}: FeedItemProps) {
  const [isBoostLoading, setIsBoostLoading] = useState(false);

  const handleBoost = async () => {
    if (!canBoost) return;
    
    setIsBoostLoading(true);
    try {
      await onBoost(id);
    } finally {
      setIsBoostLoading(false);
    }
  };

  return (
    <div className="border border-[var(--app-gray)] rounded-lg p-4 mb-4 bg-[var(--app-background)]">
      <div className="flex items-start mb-3">
        <div className="mr-3">
          <Identity address={author.address}>
            <Avatar />
          </Identity>
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <Identity address={author.address}>
              <Name className="font-semibold" />
            </Identity>
            <span className="text-xs text-[var(--app-foreground-muted)] ml-2">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
          <p className="mt-1">{content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--app-gray)]">
        <div className="px-2 py-1 bg-[var(--app-gray)] rounded text-xs">
          {coinName} ({coinSymbol})
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">{boostCount} boosts</span>
          <Button
            variant={canBoost ? "primary" : "ghost"}
            size="sm"
            onClick={handleBoost}
            disabled={!canBoost || isBoostLoading}
            className={!canBoost ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isBoostLoading ? "Boosting..." : canBoost ? "Boost" : "Need coins"}
          </Button>
        </div>
      </div>
    </div>
  );
} 